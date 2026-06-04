const mongoose = require("mongoose");

const notificationSchema = new mongoose.Schema(
  {
    title: String,
    body: String,
    
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
    
    isForGuest: {
      type: Boolean,
      default: false
    },
    
    type: {
      type: String, // offer, booking, system, etc
    },
    
    data: {
      type: Object // optional extra payload
    },
    
    isRead: {
      type: Boolean,
      default: false
    }
  },
  { timestamps: true }
);

module.exports = mongoose.model("Notification", notificationSchema);
