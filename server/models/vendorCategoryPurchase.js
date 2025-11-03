const mongoose = require("mongoose");

const vendorCategoryPurchaseSchema = new mongoose.Schema(
  {
    vendor: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Vendor",
      required: true,
    },
    category: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    status: {
      type: String,
      enum: ["pending", "purchased", "rejected"],
      default: "purchased",
    },
    transactionId: {
      type: String,
      trim: true,
    },
    paymentMode: {
      type: String,
      enum: ["prepaid", "cash"],
      default: "prepaid",
    },
  },
  { timestamps: true }
);

vendorCategoryPurchaseSchema.index({ vendor: 1, category: 1 }, { unique: true });

module.exports = mongoose.model("VendorCategoryPurchase", vendorCategoryPurchaseSchema);