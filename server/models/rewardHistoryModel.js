const mongoose = require("mongoose");

const rewardHistorySchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "auth",
            required: true,
        },

        points: {
            type: Number,
            required: true,
        },

        type: {
            type: String,
            enum: ["credit", "debit"],
            required: true,
        },

        source: {
            type: String,
            enum: ["referral", "download", "redemption"],
            required: true,
        },

        description: {
            type: String,
            required: true,
        },

        // For referral tracking
        referredUserId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "auth",
        },

        // For redemption tracking
        redeemCodeId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "RedeemCode",
        },

        // Balance after this transaction
        balanceAfter: {
            type: Number,
            required: true,
        },
    },
    { timestamps: true }
);

// Index for faster queries
rewardHistorySchema.index({ userId: 1, createdAt: -1 });

module.exports = mongoose.model("RewardHistory", rewardHistorySchema);
