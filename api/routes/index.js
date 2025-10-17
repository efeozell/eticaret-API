import authRoutes from "./auth.routes.js";

const mountRoutes = (app) => {
  app.use("/api/auth", authRoutes);
};

export default mountRoutes;
