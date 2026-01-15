import Booking from "../model/booking.model.js";

const isTimeOverlapping = (start1, end1, start2, end2) => {
  const time1Start = start1.split(":").map(Number);
  const time1End = end1.split(":").map(Number);
  const time2Start = start2.split(":").map(Number);
  const time2End = end2.split(":").map(Number);

  const minutes1Start = time1Start[0] * 60 + time1Start[1];
  const minutes1End = time1End[0] * 60 + time1End[1];
  const minutes2Start = time2Start[0] * 60 + time2Start[1];
  const minutes2End = time2End[0] * 60 + time2End[1];

  return !(minutes1End <= minutes2Start || minutes1Start >= minutes2End);
};

const getTimeSlot = (time) => {
  const [hours] = time.split(":").map(Number);
  // Return DB enum values for slot
  return hours < 12 ? "FIRST_HALF" : "SECOND_HALF";
};

export const createBooking = async (req, res) => {
  try {
    const {
      customerName,
      customerEmail,
      bookingDate,
      bookingType,
      bookingSlot,
      bookingFromTime,
      bookingToTime,
    } = req.body;
    const userId = req.user.userId;

    if (!customerName || !customerEmail || !bookingDate || !bookingType) {
      return res.status(400).json({
        message: "Customer name, email, booking date, and type are required",
      });
    }

    // Normalize incoming booking type/slot from client to DB enum format
    const normalizeType = (t) => {
      if (!t) return t;
      const map = {
        "Full Day": "FULL_DAY",
        "Half Day": "HALF_DAY",
        Custom: "CUSTOM",
        FULL_DAY: "FULL_DAY",
        HALF_DAY: "HALF_DAY",
        CUSTOM: "CUSTOM",
      };
      return map[t] || t;
    };

    const normalizeSlot = (s) => {
      if (!s) return s;
      const map = {
        "First Half": "FIRST_HALF",
        "Second Half": "SECOND_HALF",
        FIRST_HALF: "FIRST_HALF",
        SECOND_HALF: "SECOND_HALF",
      };
      return map[s] || s;
    };

    const bookingTypeNorm = normalizeType(bookingType);
    const bookingSlotNorm = normalizeSlot(bookingSlot);

    if (bookingTypeNorm === "HALF_DAY" && !bookingSlotNorm) {
      return res
        .status(400)
        .json({ message: "Booking slot is required for Half Day bookings" });
    }

    if (bookingType === "Custom") {
      if (!bookingFromTime || !bookingToTime) {
        return res.status(400).json({
          message: "Booking from and to times are required for Custom bookings",
        });
      }
      if (bookingFromTime >= bookingToTime) {
        return res.status(400).json({
          message: "Booking from time must be before booking to time",
        });
      }
    }

    const existingBookings = await Booking.findAll({
      where: {
        bookingDate,
      },
      attributes: [
        "bookingType",
        "bookingSlot",
        "bookingFromTime",
        "bookingToTime",
      ],
    });

    for (const existing of existingBookings) {
      if (existing.bookingType === "FULL_DAY") {
        return res.status(409).json({
          message: "A Full Day booking already exists for this date",
        });
      }
      if (bookingTypeNorm === "FULL_DAY") {
        return res.status(409).json({
          message:
            "Cannot create Full Day booking. Other bookings exist for this date",
        });
      }

      // Rule 2: Half Day booking conflicts
      if (existing.bookingType === "HALF_DAY") {
        if (
          bookingTypeNorm === "HALF_DAY" &&
          existing.bookingSlot === bookingSlotNorm
        ) {
          return res.status(409).json({
            message: `A ${bookingSlot} booking already exists for this date`,
          });
        }
        if (bookingTypeNorm === "CUSTOM") {
          const existingSlot = existing.bookingSlot;
          const newSlot = getTimeSlot(bookingFromTime);
          if (existingSlot === newSlot) {
            return res.status(409).json({
              message: `Cannot create Custom booking. ${existingSlot} is already booked`,
            });
          }
        }
      }

      // Rule 3: Custom booking conflicts
      if (existing.bookingType === "CUSTOM") {
        if (bookingTypeNorm === "HALF_DAY") {
          // Check if Custom booking overlaps with the requested half day slot
          const existingSlot = getTimeSlot(existing.bookingFromTime);
          if (existingSlot === bookingSlotNorm) {
            return res.status(409).json({
              message: `Cannot create ${bookingSlot} booking. Custom booking exists in this slot`,
            });
          }
        }
        if (bookingTypeNorm === "CUSTOM") {
          // Check for time overlap
          if (
            isTimeOverlapping(
              existing.bookingFromTime,
              existing.bookingToTime,
              bookingFromTime,
              bookingToTime
            )
          ) {
            return res.status(409).json({
              message: "Time slot overlaps with an existing Custom booking",
            });
          }
        }

        if (bookingTypeNorm === "FULL_DAY") {
          return res.status(409).json({
            message:
              "Cannot create Full Day booking. Custom bookings exist for this date",
          });
        }
      }
    }

    const booking = await Booking.create({
      customerName,
      customerEmail,
      bookingDate,
      // Store normalized DB enum values
      bookingType: bookingTypeNorm,
      bookingSlot: bookingTypeNorm === "HALF_DAY" ? bookingSlotNorm : null,
      bookingFromTime: bookingTypeNorm === "CUSTOM" ? bookingFromTime : null,
      bookingToTime: bookingTypeNorm === "CUSTOM" ? bookingToTime : null,
      userId,
    });

    res.status(201).json({
      message: "Booking created successfully",
      booking,
    });
  } catch (error) {
    console.error("Create booking error:", error);
    res.status(500).json({ message: "Server error during booking creation" });
  }
};

export const getBookings = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { page = 1, limit = 10, bookingDate } = req.query;
    const offset = (page - 1) * limit;

    const whereClause = { userId };
    if (bookingDate) {
      whereClause.bookingDate = bookingDate;
    }

    const { count, rows } = await Booking.findAndCountAll({
      where: whereClause,
      limit: Number.parseInt(limit, 10),
      offset: Number.parseInt(offset, 10),
      order: [
        ["bookingDate", "DESC"],
        ["createdAt", "DESC"],
      ],
    });

    res.json({
      bookings: rows,
      total: count,
      page: Number.parseInt(page, 10),
      totalPages: Math.ceil(count / limit),
    });
  } catch (error) {
    console.error("Get error in fetching bookings data:", error);
    res.status(500).json({ message: "Error fetching bookings data" });
  }
};
