import express from "express";
import {
  addToCart,
  removeAllFromCart,
  getCartByUser,
  removeSpesificCartItem,
  updateCartItemQuantity,
} from "../controllers/cart.controller.js";
import { protectRoute } from "../middlewares/auth.middleware.js";

const router = express.Router();

router.post("/", protectRoute, addToCart);
router.delete("/", protectRoute, removeAllFromCart);
router.delete("/:itemId", protectRoute, removeSpesificCartItem);
router.put("/:itemId", protectRoute, updateCartItemQuantity);
router.get("/", protectRoute, getCartByUser);

export default router;
