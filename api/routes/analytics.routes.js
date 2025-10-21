import express from "express";
import { adminRoute, protectRoute } from "../middlewares/auth.middleware.js";
import { getAllAnalyticsData } from "../controllers/analytics.controller.js";

const router = express.Router();

router.get("/", protectRoute, adminRoute, getAllAnalyticsData);

export default router;
