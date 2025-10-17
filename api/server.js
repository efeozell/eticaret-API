import express from "express";
import { ENV } from "./config/env.js";
import authRoutes from "../api/routes/auth.routes.js";
import { connectDb } from "../api/lib/db.js";
import mountRoutes from "./routes/index.js";
import helmet from "helmet";
import cookieParser from "cookie-parser";

const app = express();
const PORT = ENV.PORT;

app.use(express.json());
app.use(cookieParser()); //gelen isteklerdeki cookie'leri okumak icin
app.use(helmet());

// Bu metod sayesinde bir cok routeri farkli bir dosyada tutup buraya import edebiliriz
mountRoutes(app);

connectDb().then(() => {
  app.listen(PORT, () => {
    console.log(`Server has been started in ${PORT}`);
  });
});
