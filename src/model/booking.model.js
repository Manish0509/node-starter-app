import { DataTypes } from "sequelize";
import sequelize from "../config/db.js";
import User from "./users.model.js";

const Booking = sequelize.define(
  "bookings",
  {
    id: {
      type: DataTypes.BIGINT,
      autoIncrement: true,
      primaryKey: true,
    },
    customerName: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    customerEmail: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: { isEmail: true },
    },
    bookingDate: {
      type: DataTypes.DATEONLY,
      allowNull: false,
      field: "booking_date",
    },
    bookingType: {
      // Use enum values that match existing DB values
      type: DataTypes.ENUM("FULL_DAY", "HALF_DAY", "CUSTOM"),
      allowNull: false,
      field: "booking_type",
    },
    bookingSlot: {
      type: DataTypes.ENUM("FIRST_HALF", "SECOND_HALF"),
      allowNull: true,
      field: "booking_slot",
    },
    bookingFromTime: {
      type: DataTypes.TIME,
      allowNull: true,
      field: "start_time",
    },
    bookingToTime: {
      type: DataTypes.TIME,
      allowNull: true,
      field: "end_time",
    },
    userId: {
      type: DataTypes.BIGINT,
      allowNull: false,
      references: {
        model: "users",
        key: "id",
      },
      field: "user_id",
    },
  },
  {
    timestamps: true,
    indexes: [
      {
        // use DB column names here to align with existing table
        fields: ["booking_date"],
      },
      {
        fields: ["user_id"],
      },
      {
        fields: ["booking_date", "booking_type", "booking_slot"],
      },
      {
        fields: ["booking_date", "start_time", "end_time"],
      },
    ],
  }
);

Booking.belongsTo(User, { foreignKey: "userId", as: "user" });
User.hasMany(Booking, { foreignKey: "userId", as: "bookings" });

export default Booking;
