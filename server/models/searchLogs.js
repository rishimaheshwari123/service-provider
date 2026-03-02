const mongoose = require("mongoose");

const searchLogsSchema = new mongoose.Schema(
  {
    searchQuery: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      default: "All Categories",
    },
    location: {
      type: String,
      default: "Unknown",
    },
    page: {
      type: String,
      enum: ["Home", "Services"],
      required: true,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "auth",
    },
    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vendor",
    },
    ipAddress: {
      type: String,
    },
    userAgent: {
      type: String,
    },
    resultsCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for faster queries
searchLogsSchema.index({ searchQuery: 1, createdAt: -1 });
searchLogsSchema.index({ category: 1 });
searchLogsSchema.index({ page: 1 });
searchLogsSchema.index({ createdAt: -1 });

module.exports = mongoose.model("SearchLogs", searchLogsSchema);
