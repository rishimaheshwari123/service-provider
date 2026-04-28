const mongoose = require("mongoose");

const vendorRewardSettingsSchema = new mongoose.Schema(
    {
        vendorId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Vendor",
            required: true,
            unique: true,
        },

        acceptsRewardPoints: {
            type: Boolean,
            default: false,
        },

        discountType: {
            type: String,
            enum: ["percentage", "flat"],
            default: "flat",
        },

        // Discount percentage (for percentage type)
        discountPercentage: {
            type: Number,
            min: 0,
            max: 100,
            default: 0,
        },

        // Maximum discount limit (optional)
        maxDiscountAmount: {
            type: Number,
            min: 0,
        },

        // Minimum order value to use reward points (optional)
        minOrderValue: {
            type: Number,
            min: 0,
            default: 0,
        },

        isActive: {
            type: Boolean,
            default: true,
        },

        updatedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "auth",
        },
    },
    { timestamps: true }
);

// Index for faster queries
vendorRewardSettingsSchema.index({ vendorId: 1 });

module.exports = mongoose.model("VendorRewardSettings", vendorRewardSettingsSchema);
