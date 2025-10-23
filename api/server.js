import express from "express";
import { ENV } from "./config/env.js";
import { connectDb } from "../api/lib/db.js";
import mountRoutes from "./routes/index.js";
import helmet from "helmet";
import cookieParser from "cookie-parser";
import cors from "cors";
import { webhookCheckout } from "./controllers/order.controller.js";
import { arcjetProtection } from "./middlewares/arcjet.middleware.js";

const app = express();
const PORT = ENV.PORT;

app.post("/webhook-checkout", express.raw({ type: "application/json" }), webhookCheckout);

app.use(express.json());
app.use(cors({ origin: ENV.CLIENT_URL, credentials: true }));
app.use(cookieParser()); //gelen isteklerdeki cookie'leri okumak icin
app.use(helmet());

app.use(arcjetProtection);

// Bu metod sayesinde bir cok routeri farkli bir dosyada tutup buraya import edebiliriz
mountRoutes(app);

app.use(function (req, res, next) {
  res.status(404).json({ message: "Not found" });
});

//hata donuslerinde bilgi sizdirmamak icin
app.use((error, req, res, next) => {
  if (error instanceof SyntaxError && error.status === 400 && "body" in error) {
    console.error("Bad JSON received: ", error.message);

    return res.status(400).json("Bad request, The json payload is malforme. Please check the syntax");
  }

  console.error("An unexpected error occured: ", error);

  return res.status(500).json("Internal Server Error, Something went wrong");
});

connectDb().then(() => {
  app.listen(PORT, () => {
    console.log(`Server has been started in ${PORT}`);
    try {
      console.log("process exit listeners count:", process.listeners("exit").length);
    } catch (err) {
      console.log("Could not read process listeners:", err.message);
    }
  });
});
