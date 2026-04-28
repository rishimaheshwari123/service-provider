const mongoose = require("mongoose");

const rewardPointsSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "auth",
            required: true,
        },

        totalPoints: {
            type: Number,
            default: 0,
            min: 0,
        },

        availablePoints: {
            type: Number,
            default: 0,
            min: 0,
        },

        usedPoints: {
            type: Number,
            default: 0,
            min: 0,
        },

        referralCount: {
            type: Number,
            default: 0,
            min: 0,
        },

        referredUsers: [
            {
                userId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "auth",
                },
                name: String,
                email: String,
                phone: String,
                pointsEarned: Number,
                date: {
                    type: Date,
                    default: Date.now,
                },
            },
        ],
    },
    { timestamps: true }
);

// Index for faster queries
rewardPointsSchema.index({ userId: 1 });

module.exports = mongoose.model("RewardPoints", rewardPointsSchema);
