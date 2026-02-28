const mongoose = require("mongoose");

const communicationLogsSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: ["SMS", "WhatsApp", "Email"],
      required: true,
    },
    purpose: {
      type: String,
      enum: [
        "OTP",
        "Welcome",
        "Approval",
        "Rejection",
        "Password Reset",
        "Notification",
        "Other"
      ],
      required: true,
    },
    recipient: {
      phone: {
        type: String,
      },
      email: {
        type: String,
      },
      name: {
        type: String,
      },
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vendor",
    },
    message: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: ["Success", "Failed", "Pending"],
      default: "Pending",
    },
    response: {
      type: mongoose.Schema.Types.Mixed,
    },
    errorMessage: {
      type: String,
    },
    cost: {
      type: Number,
      default: 0,
    },
    provider: {
      type: String,
      default: "Default",
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for faster queries
communicationLogsSchema.index({ type: 1, createdAt: -1 });
communicationLogsSchema.index({ status: 1 });
communicationLogsSchema.index({ vendorId: 1 });
communicationLogsSchema.index({ userId: 1 });

module.exports = mongoose.model("CommunicationLogs", communicationLogsSchema);
