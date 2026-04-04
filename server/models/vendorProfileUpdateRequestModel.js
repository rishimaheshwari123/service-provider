const mongoose = require("mongoose");

const vendorProfileUpdateRequestSchema = new mongoose.Schema(
  {
    vendorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vendor",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
    // Store the changes requested
    requestedChanges: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    // Store original data for comparison
    originalData: {
      type: mongoose.Schema.Types.Mixed,
      required: true,
    },
    // Changed fields list for quick reference
    changedFields: {
      type: [String],
      default: [],
    },
    // Admin who approved/rejected
    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Auth",
    },
    reviewedAt: {
      type: Date,
    },
    rejectionReason: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("VendorProfileUpdateRequest", vendorProfileUpdateRequestSchema);
