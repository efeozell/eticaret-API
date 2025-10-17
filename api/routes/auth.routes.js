import express from "express";
import { signup, login, logout, refreshToken, getProfile } from "../controllers/auth.controller.js";
import { signupValidator, loginValidator } from "../utils/validators/auth.validator.js";

const router = express.Router();

router.post("/signup", signupValidator, signup);
router.post("/login", loginValidator, login);
router.post("/logout", logout);
router.post("/refresh-token", refreshToken);
// router.get("/profile", protectedRoute, getProfile);

export default router;
