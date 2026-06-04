const mongoose = require("mongoose");

const deviceSchema = new mongoose.Schema({
  deviceId: {
    type: String,
    required: true,
    unique: true
  },
  fcmToken: {
    type: String,
    required: true
  }, // 🔔 notification token
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "auth",
    default: null
  },
  vendorId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Vendor",
    default: null
  },
  isGuest: {
    type: Boolean,
    default: true
  },
  platform: {
    type: String,
    default: "android"
  },
  topics: {
    type: [String],
    default: []
  }
}, { timestamps: true });

module.exports = mongoose.model("Device", deviceSchema);
