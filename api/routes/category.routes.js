import express from "express";
import { protectRoute, adminRoute } from "../middlewares/auth.middleware.js";
import { getAllCategory, createCategory, updateCategory, deleteCategory } from "../controllers/category.controller.js";

const router = express.Router();

//ADMIN ROUTES
router.get("/", protectRoute, adminRoute, getAllCategory);
router.post("/", protectRoute, adminRoute, createCategory);
router.put("/", protectRoute, adminRoute, updateCategory);
router.delete("/", protectRoute, adminRoute, deleteCategory);

export default router;
