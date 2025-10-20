import User from "../models/user.model.js";
import { sanitizeUser } from "../utils/sanitize_data.js";
import { generateToken, storeRefreshToken, setCookies } from "../lib/token.service.js";
import { redis } from "../lib/redis.js";
import jwt from "jsonwebtoken";
import { ENV } from "../config/env.js";

export const signup = async (req, res) => {
  const { email, password, name } = req.body;

  const isEmailExist = await User.findOne(email);

  if (isEmailExist) {
    return res.status(400).json({ message: "Email already exist" });
  }

  try {
    const user = await User.create({
      name,
      email,
      password,
    });

    //authenticate
    const { accessToken, refreshToken } = generateToken(user._id);
    await storeRefreshToken(user._id, refreshToken);

    setCookies(res, accessToken, refreshToken);

    res.status(201).json({ user: sanitizeUser(user), message: "User created succesfully" });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error" });
    console.log("Error in signup: ", error);
  }
};

export const login = async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    const saltPassword = await user.comparePassword(password);

    if (user && saltPassword) {
      const { accessToken, refreshToken } = generateToken(user._id);

      await storeRefreshToken(user._id, refreshToken);

      setCookies(res, accessToken, refreshToken);

      res.json({ user: sanitizeUser(user), message: "Login successful" });
    }

    if (!saltPassword) {
      return res.status(400).json({ message: "Invalid email or password" });
    }
  } catch (error) {
    res.status(500).json({ message: "Internal server error", error });
    console.log("Error in login: ", error);
  }
};

export const logout = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (refreshToken) {
      //tokeni decode edip kullanicinin idsine gore redisden sil
      const decoded = jwt.verify(refreshToken, ENV.REFRESH_TOKEN_SECRET);
      await redis.del(`refresh_token:${decoded.userId}`);
    } else if (!refreshToken) {
      return res.status(400).json({ message: "No refresh token provided" });
    }

    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");
    res.json({ message: "Logged out successfully" });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error", error: error.message });
    console.log("Error in logout: ", error);
  }
};

//Kullanicinin refresh tokeni gecerliyse yeni accessToken olusturur ve bunu cookie olarak gonderir
export const refreshToken = async (req, res) => {
  try {
    const refreshToken = req.cookies.refreshToken;
    if (!refreshToken) {
      return res.status(400).json({ message: "No refresh token provided" });
    }

    const decoded = jwt.verify(refreshToken, ENV.REFRESH_TOKEN_SECRET);
    const storedToken = await redis.get(`refresh_token:${decoded.userId}`);

    if (storedToken !== refreshToken) {
      return res.status(403).json({ message: "Invalid refresh token" });
    }

    const accessToken = jwt.sign({ userId: decoded.userId }, ENV.ACCESS_TOKEN_SECRET, {
      expiresIn: "15m",
    });

    res.cookie("accessToken", accessToken, {
      httpOnly: true,
      secure: ENV.NODE_ENV === "production",
      maxAge: 15 * 60 * 1000, // 15 minutes
      sameSite: "strict",
    });

    res.json({ message: "Access token refreshed successfully" });
  } catch (error) {
    res.status(500).json({ message: "Internal Server Error", error: error.message });
    console.log("Error in refreshToken: ", error);
  }
};

//TODO: Kullanici profil bilgilerini dondur
export const getProfile = async (req, res) => {
  const userId = req.user._id;

  try {
    const user = await User.findById(userId).select("name email role");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.status(200).json(sanitizeUser(user));
  } catch (error) {
    console.log("Error in getProfile: ", error);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
};
