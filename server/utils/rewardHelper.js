const RewardSettings = require("../models/rewardSettingsModel");
const RewardPoints = require("../models/rewardPointsModel");
const RewardHistory = require("../models/rewardHistoryModel");
const Auth = require("../models/authModel");
const crypto = require("crypto");

// Generate unique referral code
exports.generateReferralCode = async (userId) => {
    try {
        let code;
        let isUnique = false;
        
        while (!isUnique) {
            code = crypto.randomBytes(4).toString("hex").toUpperCase();
            const existingUser = await Auth.findOne({ referralCode: code });
            if (!existingUser) {
                isUnique = true;
            }
        }
        
        return code;
    } catch (error) {
        console.error("Error generating referral code:", error);
        throw error;
    }
};

// Process referral rewards
exports.processReferralReward = async (referrerId, newUserId) => {
    try {
        // Get reward settings
        const settings = await RewardSettings.findOne();
        if (!settings || !settings.isActive || settings.referralPoints <= 0) {
            console.log("Referral rewards not active or not configured");
            return;
        }

        const referralPoints = settings.referralPoints;

        // Get referrer and new user details
        const referrer = await Auth.findById(referrerId);
        const newUser = await Auth.findById(newUserId);

        if (!referrer || !newUser) {
            console.log("Referrer or new user not found");
            return;
        }

        // ===== Reward Referrer =====
        let referrerRewardPoints = await RewardPoints.findOne({ userId: referrerId });
        if (!referrerRewardPoints) {
            referrerRewardPoints = await RewardPoints.create({
                userId: referrerId,
                totalPoints: 0,
                availablePoints: 0,
                usedPoints: 0,
                referralCount: 0,
            });
        }

        // Add points to referrer
        referrerRewardPoints.totalPoints += referralPoints;
        referrerRewardPoints.availablePoints += referralPoints;
        referrerRewardPoints.referralCount += 1;
        referrerRewardPoints.referredUsers.push({
            userId: newUserId,
            name: newUser.name,
            email: newUser.email,
            phone: newUser.phone,
            pointsEarned: referralPoints,
            date: new Date(),
        });
        await referrerRewardPoints.save();

        // Create history entry for referrer
        await RewardHistory.create({
            userId: referrerId,
            points: referralPoints,
            type: "credit",
            source: "referral",
            description: `Referral reward for inviting ${newUser.name || newUser.email}`,
            referredUserId: newUserId,
            balanceAfter: referrerRewardPoints.availablePoints,
        });

        // ===== Reward New User =====
        let newUserRewardPoints = await RewardPoints.findOne({ userId: newUserId });
        if (!newUserRewardPoints) {
            newUserRewardPoints = await RewardPoints.create({
                userId: newUserId,
                totalPoints: 0,
                availablePoints: 0,
                usedPoints: 0,
                referralCount: 0,
            });
        }

        // Add points to new user
        newUserRewardPoints.totalPoints += referralPoints;
        newUserRewardPoints.availablePoints += referralPoints;
        await newUserRewardPoints.save();

        // Create history entry for new user
        await RewardHistory.create({
            userId: newUserId,
            points: referralPoints,
            type: "credit",
            source: "referral",
            description: `Welcome reward for joining via referral from ${referrer.name || referrer.email}`,
            referredUserId: referrerId,
            balanceAfter: newUserRewardPoints.availablePoints,
        });

        console.log(`Referral rewards processed: ${referralPoints} points to both users`);
        return {
            success: true,
            referrerPoints: referralPoints,
            newUserPoints: referralPoints,
        };
    } catch (error) {
        console.error("Error processing referral reward:", error);
        throw error;
    }
};

// Expire old redeem codes (can be called via cron job)
exports.expireOldRedeemCodes = async () => {
    try {
        const RedeemCode = require("../models/redeemCodeModel");
        
        const result = await RedeemCode.updateMany(
            {
                status: "active",
                expiresAt: { $lt: new Date() },
            },
            {
                $set: { status: "expired" },
            }
        );

        console.log(`Expired ${result.modifiedCount} redeem codes`);
        return result;
    } catch (error) {
        console.error("Error expiring redeem codes:", error);
        throw error;
    }
};
