import authRoutes from "./auth.routes.js";
import productRoutes from "./product.routes.js";

const mountRoutes = (app) => {
  app.use("/api/auth", authRoutes);
  app.use("/api/products", productRoutes);
};

export default mountRoutes;
