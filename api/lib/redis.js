import { Redis } from "@upstash/redis";
import { ENV } from "../config/env.js";

export const redis = new Redis({
  url: ENV.UPSTASH_REDIS_REST_URL,
  token: ENV.UPSTASH_REDIS_REST_TOKEN,
});
