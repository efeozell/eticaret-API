import authRoutes from "./auth.routes.js";
import productRoutes from "./product.routes.js";
import cartRoutes from "./cart.routes.js";
import couponRoutes from "./coupon.routes.js";
import categoryRoutes from "./category.routes.js";

const mountRoutes = (app) => {
  app.use("/api/auth", authRoutes);
  app.use("/api/products", productRoutes);
  app.use("/api/category", categoryRoutes);
  app.use("/api/cart", cartRoutes);
  app.use("/api/coupons", couponRoutes);
};

export default mountRoutes;
