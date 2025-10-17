import { Realtime } from "@upstash/realtime";
import { ENV } from "../config/env.js";

// Keep a single Realtime instance across module reloads/hot-reload
if (!globalThis.__UPSTASH_REALTIME_CLIENT) {
  globalThis.__UPSTASH_REALTIME_CLIENT = new Realtime({
    url: ENV.UPSTASH_REALTIME_URL,
    token: ENV.UPSTASH_REALTIME_TOKEN,
  });
}

export const realtime = globalThis.__UPSTASH_REALTIME_CLIENT;
export default realtime;
