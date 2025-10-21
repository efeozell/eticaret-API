import express from "express";
import { adminRoute, protectRoute } from "../middlewares/auth.middleware.js";
import {
  createCheckoutSession,
  findAllOrders,
  findSpesificOrderByUser,
  findSpesificOrder,
  findOrdersByStatus,
  updateOrderStatus,
} from "../controllers/order.controller.js";

const router = express.Router();

//CUSTOMER ROUTES
router.post("/checkout-session/:cartId", protectRoute, createCheckoutSession);
router.get("/", protectRoute, findSpesificOrderByUser);

//ADMIN ROUTES
router.get("/", protectRoute, adminRoute, findAllOrders);
router.get("/:id", protectRoute, adminRoute, findSpesificOrder);
router.get("/status/:status", protectRoute, adminRoute, findOrdersByStatus);
router.patch("/:id", protectRoute, adminRoute, updateOrderStatus);

export default router;
