import express from "express";
import {
  createCoupon,
  getAllCoupons,
  getCouponById,
  updateCouponById,
  deleteCouponById,
  applyCoupon,
} from "../controllers/coupon.controller.js";
import { adminRoute, protectRoute } from "../middlewares/auth.middleware.js";
const router = express.Router();

//ADMIN ROUTES
router.post("/", protectRoute, adminRoute, createCoupon);
router.get("/", protectRoute, adminRoute, getAllCoupons);
router.get("/:id", protectRoute, adminRoute, getCouponById);
router.put("/:id", protectRoute, adminRoute, updateCouponById);
router.delete("/:id", protectRoute, adminRoute, deleteCouponById);

//CUSTOMER ROUTES
router.post("/apply", protectRoute, applyCoupon);

export default router;
