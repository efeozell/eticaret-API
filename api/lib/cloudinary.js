import { v2 as cloudinary } from "cloudinary";
import { ENV } from "../config/env.js";

cloudinary.config({
  cloud_name: ENV.CLODINARY_CLOUD_NAME,
  api_key: ENV.CLODINARY_API_KEY,
  api_secret: ENV.CLODINARY_API_SECRET,
});

export default cloudinary;
