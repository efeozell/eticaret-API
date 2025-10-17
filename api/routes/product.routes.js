import express from "express";
import {
  getAllProducts,
  getFeaturedProducts,
  createProduct,
  deleteProduct,
  getRecommendedProducts,
  getProductsByCategory,
  toggleFeaturedProduct,
  updateProduct,
} from "../controllers/product.controller.js";
import { adminRoute, protectRoute } from "../middlewares/auth.middleware.js";
import {
  createProductValidator,
  deleteProductValidator,
  updateProductValidator,
} from "../utils/validators/product.validator.js";

const router = express.Router();

//CUSTOMER ROUTES
router.get("/featured", getFeaturedProducts);
router.get("/recommended", protectRoute, getRecommendedProducts);
router.get("/category/:category", getProductsByCategory);

//ADMIN ROUTES
router.get("/", protectRoute, adminRoute, getAllProducts);
router.post("/", protectRoute, adminRoute, createProductValidator, createProduct);
router.delete("/:id", protectRoute, adminRoute, deleteProductValidator, deleteProduct);
router.put("/:id", protectRoute, adminRoute, updateProductValidator, updateProduct);
router.patch("/:id", protectRoute, adminRoute, deleteProductValidator, toggleFeaturedProduct);

export default router;
