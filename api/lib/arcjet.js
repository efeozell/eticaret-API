import arcjet, { shield, detectBot, slidingWindow } from "@arcjet/node";
import { ENV } from "../config/env.js";

const aj = arcjet({
  key: ENV.ARCJET_KEY,
  rules: [
    shield({ mode: "DRY_RUN" }),
    detectBot({
      mode: "DRY_RUN",

      allow: ["CATEGORY:SEARCH_ENGINE"],
    }),

    slidingWindow({
      mode: "DRY_RUN",
      max: 100,
      interval: 60,
    }),
  ],
});

export default aj;
