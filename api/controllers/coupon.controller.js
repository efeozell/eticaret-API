import Coupon from "../models/coupon.model.js";
import Cart from "../models/cart.model.js";
import { stripe } from "../lib/stripe.js";

export const createCoupon = async (req, res) => {
  const { code, discountPercentage, discountType, expirationDate, isActive, usageLimit } = req.body;

  try {
    const isCodeExist = await Coupon.findOne({ code });
    if (isCodeExist) {
      res.status(400).json({ message: "Coupon already exist" });
    }

    const couponParams = {
      duration: "once",
      name: code,
      ...(discountType === "percentage" ? { percent_off: discountPercentage } : { amount_off: discountPercentage }),
    };

    const stripeCoupon = await stripe.coupons.create(couponParams);

    const newCoupon = await Coupon.create({
      code,
      discountPercentage,
      discountType,
      expirationDate,
      usageLimit,
      isActive,
      stripeCouponId: stripeCoupon.id,
    });

    res.status(201).json({ message: "Coupon created successfully" }, newCoupon);
  } catch (error) {
    console.log("Error in createCoupon: ", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getAllCoupons = async (req, res) => {
  try {
    const coupons = await Coupon.find({});
    if (!coupons || coupons.length < 1) {
      return res.status(404).json({ message: "Coupon not found" });
    }

    res.status(200).json(coupons);
  } catch (error) {
    console.log("Error in getAllCoupons: ", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const getCouponById = async (req, res) => {
  if (!req.params.id) {
    return res.status(400).json({ message: "coupon id is required" });
  }

  try {
    const coupon = await Coupon.findById(req.params.id);
    if (!coupon) {
      return res.status(404).json({ message: "Coupon not found" });
    }

    res.status(200).json(coupon);
  } catch (error) {
    console.log("Error in getCouponById: ", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const updateCouponById = async (req, res) => {
  if (!req.params.id) {
    return res.status(400).json({ message: "id is required" });
  }

  const { code, discountPercentage, discountType, expirationDate, isActive } = req.body;

  try {
    const updatedCoupon = await Coupon.findByIdAndUpdate(
      req.params.id,
      {
        code,
        discountPercentage,
        discountType,
        expirationDate,
        isActive,
      },
      { new: true }
    );

    if (!updatedCoupon) {
      return res.status(404).json({ message: "Coupon not found" });
    }

    res.status(200).json(updatedCoupon);
  } catch (error) {
    console.log("Error in updateCouponById: ", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const deleteCouponById = async (req, res) => {
  if (!req.params.id) {
    return res.status(400).json({ message: "id is required" });
  }

  try {
    const deletedCoupon = await Coupon.findByIdAndDelete(req.params.id);
    if (!deletedCoupon) {
      return res.status(404).json({ message: "Coupon not found" });
    }

    res.status(200).json({ message: "Coupon deleted Successfully" });
  } catch (error) {
    console.log("Error in deleteCouponById: ", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const applyCoupon = async (req, res) => {
  try {
    const cart = await Cart.findOne({ user: req.user._id });
    if (!cart) {
      return res.status(404).json({ message: "Cart not found" });
    }

    if (cart.cartItems.length === 0) {
      return res.status(400).json({ message: "Cart is empty, please add product" });
    }

    const coupon = await Coupon.findOne({ code: req.body.couponCode });
    if (!coupon) {
      return res.status(404).json({ message: "Coupon not found" });
    }

    if (!coupon.isActive) {
      return res.status(400).json({ message: "Coupon not active" });
    }

    const couponExpirationDate = new Date(coupon.expirationDate);

    const now = new Date();

    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    if (couponExpirationDate < startOfToday) {
      return res.status(422).json({ message: "Coupon expiration date is up" });
    }

    if (coupon.usageLimit && coupon.usageCount >= coupon.usageLimit) {
      return res.status(422).json({ message: "Coupon usage limit was exceeded" });
    }

    let totalPriceAfterDiscount;

    if (coupon.discountType === "percentage") {
      const discountPrice = cart.totalCartPrice * (coupon.discountPercentage / 100);
      totalPriceAfterDiscount = cart.totalCartPrice - discountPrice;
    } else if (coupon.discountType === "fixed") {
      totalPriceAfterDiscount = cart.totalCartPrice - coupon.discountPercentage;
    } else {
      return res.status(400).json({ message: "Invalid discount type" });
    }

    if (totalPriceAfterDiscount < 1) {
      totalPriceAfterDiscount = 0;
    }

    const updatedCart = await Cart.findOneAndUpdate(
      { user: req.user._id },
      {
        totalPriceAfterDiscount: totalPriceAfterDiscount,
        appliedCoupon: coupon.code,
      },
      { new: true }
    );

    res.status(200).json({ message: "Coupon used successfully", cart: updatedCart });
  } catch (error) {
    console.log("Error in applyCoupon: ", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};
