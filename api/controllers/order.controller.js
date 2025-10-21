import { ENV } from "../config/env.js";
import { stripe } from "../lib/stripe.js";
import Cart from "../models/cart.model.js";
import Coupon from "../models/coupon.model.js";
import Product from "../models/product.model.js";
import Order from "../models/order.model.js";
import mongoose from "mongoose";

export const createCheckoutSession = async (req, res) => {
  try {
    const cart = await Cart.findById(req.params.cartId).populate({
      path: "cartItems.product",

      select: "name price image",
    });

    if (!cart) {
      return res.status(404).json({ messsage: `There is no such cart with id ${req.params.cartId}` });
    }

    if (!cart.user.equals(req.user._id)) {
      return res.status(400).json({ message: "You do not own this cart" });
    }

    // const cartPrice = cart.totalPriceAfterDiscount ?? cart.totalCartPrice;

    // const totalOrderPrice = cartPrice + taxPrice + shippingPrice;

    let stripeCouponId = null;

    if (cart.appliedCoupon) {
      const couponFromDB = await Coupon.findOne({ code: cart.appliedCoupon });
      if (couponFromDB) {
        stripeCouponId = couponFromDB.stripeCouponId;
      }
    }

    if (couponFromDB.isActive && couponFromDB.usageCount > couponFromDB.usageLimit) {
      return res.status(400).json({ message: `This coupon limit excteeding ${cart.appliedCoupon}` });
    }

    const linesItems = cart.cartItems
      .map((item) => {
        if (!item.product) {
          console.error(`Cart item ${item._id} refers to a missing product Skipping.`);
          return null;
        }

        const price = item.product.price;
        if (typeof price !== "number" || isNaN(price)) {
          console.error(`Product ${item.product._id} has an invalid price: ${price}. Skipping.`);
          return null; // Geçersiz fiyatlı ürünü atla
        }

        const amount = Math.round(price * 100);

        return {
          price_data: {
            currency: "try",
            product_data: {
              name: item.product.name,
              images: item.product.image ? [item.product.image] : [],
            },
            unit_amount: amount,
          },
          quantity: item.quantity,
        };
      })
      .filter((item) => item !== null);

    if (linesItems.length === 0) {
      return res.status(400).json({ message: "No valid items in cart to checkout." });
    }

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ["card"],
      line_items: linesItems,
      mode: "payment",
      success_url: `${ENV.CLIENT_URL}/purchase-success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${ENV.CLIENT_URL}/cart`,
      discounts: stripeCouponId ? [{ coupon: stripeCouponId }] : [],
      customer_email: req.user.email,
      client_reference_id: cart._id.toString(),
      metadata: {
        userId: req.user._id.toString(),
      },
    });

    res.status(200).json({ status: "success", sessionId: session.id });
  } catch (error) {
    console.log("Error in createCheckoutSession: ", error);
    res.status(500).json({ message: "Error processing checkout" });
  }
};

const createCardOrder = async (session) => {
  const dbSession = await mongoose.startSession();

  try {
    dbSession.startTransaction();

    const cartId = session.client_reference_id;
    const userId = session.metadata.userId;
    const orderPrice = session.amount_total / 100;

    const cart = await Cart.findById(cartId)
      .populate({
        path: "cartItems.product",
        select: "price",
      })
      .session(dbSession);

    if (!cart) {
      throw new Error(`Webhook Error: Cart not found with id ${cartId}`);
    }

    const orderItems = cart.cartItems.map((item) => {
      if (!item.product) {
        throw new Error(`Webhook Error: Cart item ${item._id} not found`);
      }
      return {
        product: item.product._id,
        quantity: item.quantity,
        priceAtPurchase: item.product.price,
      };
    });

    const [order] = await Order.create(
      [
        {
          user: userId,
          cartItems: orderItems,
          totalAmount: orderPrice,
          status: "paid",
          paidAt: Date.now(),
          paymentMethodType: "card",
          stripeSessionId: session.id,
        },
      ],
      { session: dbSession }
    );

    if (cart.appliedCoupon) {
      const couponCode = cart.appliedCoupon;

      const updatedCoupon = await Coupon.findOneAndUpdate(
        {
          code: couponCode,
          $or: [{ usageLimit: null }, { $expr: { $lt: ["$usageCount", "$usageLimit"] } }],
        },
        { $inc: { usageCount: 1 } },
        { new: true, session: dbSession }
      );

      if (!updatedCoupon) {
        throw new Error(`Coupon limit reached or coupon invalid for code ${couponCode}`);
      }

      if (updatedCoupon && updatedCoupon.usageLimit && updatedCoupon.usageCount >= updatedCoupon.usageLimit) {
        throw new Error(`Coupon usage limit exceeeded for code: ${couponCode}`);
      }

      console.log(`Coupon ${couponCode} usage count exceeded`);
    }

    const bulkOption = cart.cartItems.map((item) => ({
      updateOne: {
        filter: { _id: item.product, quantity: { $gte: item.quantity } },
        update: { $inc: { quantity: -item.quantity, sold: +item.quantity } },
      },
    }));

    const bulkWriteResult = await Product.bulkWrite(bulkOption, { session: dbSession });

    if (bulkWriteResult.modifiedCount !== orderItems.length) {
      throw new Error("In recent updates, it was determined that the product is out of stock.");
    }

    await Cart.findByIdAndDelete(cartId, { session: dbSession });

    await dbSession.commitTransaction();

    console.log(`Order ${order._id} created successfully`);
  } catch (error) {
    await dbSession.abortTransaction();
    console.log("Error creating order", error.message);

    throw error;
  } finally {
    dbSession.endSession();
  }
};

export const webhookCheckout = async (req, res) => {
  const sig = req.headers["stripe-signature"];
  const webhookSecret = ENV.STRIPE_WEBHOOK_SECRET;

  let event;

  try {
    event = stripe.webhooks.constructEvent(req.body, sig, webhookSecret);
  } catch (error) {
    console.error(`❌ Stripe Webhook Signature verification failed: ${error.message}`);
    console.error(`Received sig:  ${sig}`);
    return res.status(400).send(`Webhook Error: ${error.message}`);
  }

  try {
    if (event.type === "checkout.session.completed") {
      const session = event.data.object;

      await createCardOrder(session);
    } else {
      console.log(`Received unhandled event type: ${event.type}`);
    }

    res.status(200).json({ received: true });
  } catch (error) {
    console.error(`Unexpected error proccessing webhook event: ${event ? event.id : `N/A`}`, error);

    res.status(500).json({ message: "Internal Server Error webhook processing" });
  }
};

export const findAllOrders = async (req, res) => {
  try {
    const orders = await Order.find({});

    if (!orders) {
      return res.status(404).json({ message: "Orders not found" });
    }

    res.status(200).json(orders);
  } catch (error) {
    console.log("Error in findAllOrder: ", error);
    res.status(500).json({ message: "Internal Server Error:" });
  }
};

export const findSpesificOrderByUser = async (req, res) => {
  const userId = req.user._id;

  try {
    const order = await Order.findOne({ user: userId });

    if (!order || order.length === 0) {
      return res.status(404).json({ message: "Orders cant found" });
    }

    res.status(200).json(order);
  } catch (error) {
    console.log("Error in findSpesificOrderByUser: ", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const findSpesificOrder = async (req, res) => {
  try {
    const { id } = req.params;

    if (!id) {
      return res.status(404).json({ message: "Id is required" });
    }

    const order = await Order.findById(id);
    if (!order) {
      return res.status(404).json({ message: "Order cant found" });
    }

    res.status(200).json(order);
  } catch (error) {
    console.log("Error in findSpesificOrder: ", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const findOrdersByStatus = async (req, res) => {
  try {
    const { status } = req.params;
    if (!status) {
      return res.status(400).json({ message: "Status is required" });
    }

    const orders = await Order.findOne({ status: status });
    if (!orders || orders.length === 0) {
      return res.status(404).json({ message: "No product was found in this status" });
    }

    res.status(200).json(orders);
  } catch (error) {
    console.log("Error in findOrdersByStatus: ", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

export const updateOrderStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    if (!id) {
      return res.status(400).json({ message: "Id is required" });
    }

    const updatedOrder = await Order.findByIdAndUpdate(id, { status: status }, { new: true, runValidators: true });

    if (!updatedOrder) {
      return res.status(404).json({ message: "Order not found" });
    }

    res.status(200).json({ message: `Order status updated to ${status}`, order: updatedOrder });
  } catch (error) {
    console.log("Error in updateOrderStatus", error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

//TODO: Siparis basarili olursa carttaki urunlerin quantitysini db'den azalt
//TODO: Kullanilan kupon varsa kuponun quantity'sini 1 azalt
