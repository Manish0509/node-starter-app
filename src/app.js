import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import configRoutes from "./routes/index.js";
import sequelize from "./config/db.js";
import "./model/users.model.js";
import "./model/booking.model.js";

dotenv.config();
const app = express();

const port = process.env.PORT || 8080;

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

configRoutes(app);

// Sync database
sequelize
  .sync({ alter: true })
  .then(() => {
    console.log("Database synced successfully");
  })
  .catch((err) => {
    console.error("Error syncing database:", err);
  });

app.listen(port, () => {
  console.log(`============ App is running on port ${port}. ============`);
});
