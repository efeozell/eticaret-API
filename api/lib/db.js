import mongoose from "mongoose";
import { ENV } from "../config/env.js";

export const connectDb = async () => {
  try {
    const conn = await mongoose.connect(ENV.MONGO_URI);
    console.log(`MongoDB connected: ${conn.connection.host}`);
  } catch (error) {
    console.log("Error connecting MongoDB");
    process.exit();
  }
};
