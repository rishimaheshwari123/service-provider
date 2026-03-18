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
    priceTier: {
      type: String,
      enum: ["basic", "premium", "premiumPlus"],
      default: "basic",
    },
    selectedPrice: {
      type: Number,
      min: 0,
    },
    finalPrice: {
      type: Number,
      min: 0,
    },
    // Coupon information
    couponCode: {
      type: String,
      trim: true,
    },
    couponId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Coupon",
    },
    discountAmount: {
      type: Number,
      default: 0,
      min: 0,
    },
    paymentMode: {
      type: String,
      enum: ["prepaid", "cash", "qr"],
      default: "prepaid",
    },
    reason: {
      type: String,
    },
    assignedByAdmin: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

vendorCategoryPurchaseSchema.index({ vendor: 1, category: 1 }, { unique: true });

module.exports = mongoose.model("VendorCategoryPurchase", vendorCategoryPurchaseSchema);