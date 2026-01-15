import express from "express";
import {
  createBooking,
  getBookings,
} from "../controller/booking.controller.js";
import { authMiddleware } from "../middleware/authMiddleWare.js";

const router = express.Router();

router.post("/", authMiddleware, createBooking);
router.get("/", authMiddleware, getBookings);

export default router;
