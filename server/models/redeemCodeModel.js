const mongoose = require("mongoose");

const redeemCodeSchema = new mongoose.Schema(
    {
        code: {
            type: String,
            required: true,
            unique: true,
            uppercase: true,
        },

        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "auth",
            required: true,
        },

        points: {
            type: Number,
            required: true,
            min: 1,
        },

        discountAmount: {
            type: Number,
            required: true,
            min: 0,
        },

        status: {
            type: String,
            enum: ["active", "used", "expired"],
            default: "active",
        },

        expiresAt: {
            type: Date,
            required: true,
        },

        // Vendor who applied the code
        appliedBy: {
            vendorId: {
                type: mongoose.Schema.Types.ObjectId,
                ref: "Vendor",
            },
            vendorName: String,
            appliedAt: Date,
        },

        // Discount details
        discountType: {
            type: String,
            enum: ["percentage", "flat"],
            required: true,
        },
    },
    { timestamps: true }
);

// Index for faster queries
redeemCodeSchema.index({ code: 1 });
redeemCodeSchema.index({ userId: 1, status: 1 });
redeemCodeSchema.index({ expiresAt: 1 });

module.exports = mongoose.model("RedeemCode", redeemCodeSchema);
