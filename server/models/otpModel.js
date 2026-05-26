const mongoose = require("mongoose");

const otpSchema = new mongoose.Schema(
  {
    number: {
      type: String,
      required: true,
      trim: true,
    },
    otp: {
      type: String,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
      expires: 600, // 10 minutes (automatically deleted by MongoDB TTL index)
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("OTP", otpSchema);
