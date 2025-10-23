import aj from "../lib/arcjet.js";

import { isSpoofedBot } from "@arcjet/inspect";

export const arcjetProtection = async (req, res, next) => {
  try {
    const decision = await aj.protect(req);

    if (decision.isDenied()) {
      if (decision.reason.isRateLimit()) {
        return res.status(429).json({ message: "Rate limit exceeed. Please try again later" });
      } else if (decision.reason.isBot()) {
        return res.status(403).json({ message: "Bot access denied" });
      } else {
        return res.status(403).json({ message: "Acces denied bu security policy" });
      }
    }

    //spoofed bot kontrolu
    if (decision.results.some(isSpoofedBot)) {
      return res.status(403).json({
        error: "Spoofed bot detected",
        message: "Malicious bo activity detected",
      });
    }
    next();
  } catch (error) {
    console.log("Arcjet Protection Error", error);
    next();
  }
};
