import authRoutes from "./auth.js";
import bookingRoutes from "./booking.js";

export default function configRoutes(app) {
  app.use("/api/auth", authRoutes);
  app.use("/api/bookings", bookingRoutes);

  app.get("/", (req, res) => {
    res.send("API is running");
  });
}
