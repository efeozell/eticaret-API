import jwt from "jsonwebtoken";
import { ENV } from "../config/env.js";
import { redis } from "../lib/redis.js";

//generate access and refresh token uretici
export const generateToken = (userId) => {
  const accessToken = jwt.sign({ userId }, ENV.ACCESS_TOKEN_SECRET, {
    expiresIn: "15m",
  });

  const refreshToken = jwt.sign({ userId }, ENV.REFRESH_TOKEN_SECRET, {
    expiresIn: "7d",
  });

  return { accessToken, refreshToken };
};

//refresh tokeni redise atiyoruz
export const storeRefreshToken = async (userId, refreshToken) => {
  await redis.set(`refresh_token:${userId}`, refreshToken, { ex: 7 * 24 * 60 * 60 });
};

//send token in cookies
export const setCookies = (res, accessToken, refreshToken) => {
  res.cookie("accessToken", accessToken, {
    httpOnly: true,
    secure: ENV.NODE === "production",
    sameSite: "strict",
    maxAge: 15 * 60 * 1000,
  });

  res.cookie("refreshToken", refreshToken, {
    httpOnly: true, //XSS saldilarindan korunmak icin
    secure: ENV.NODE === "production",
    sameSite: "strict",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
};
