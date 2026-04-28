const mongoose = require("mongoose");

const rewardSettingsSchema = new mongoose.Schema(
    {
        // Referral Reward Settings
        referralPoints: {
            type: Number,
            default: 0,
            min: 0,
        },
        referralDiscountType: {
            type: String,
            enum: ["percentage", "flat"],
            default: "flat",
        },

        // Download Reward Settings
        downloadPoints: {
            type: Number,
            default: 0,
            min: 0,
        },
        downloadDiscountType: {
            type: String,
            enum: ["percentage", "flat"],
            default: "flat",
        },

        // Global Settings
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

module.exports = mongoose.model("RewardSettings", rewardSettingsSchema);
