const RewardSettings = require("../models/rewardSettingsModel");
const RewardPoints = require("../models/rewardPointsModel");
const RewardHistory = require("../models/rewardHistoryModel");
const RedeemCode = require("../models/redeemCodeModel");
const Auth = require("../models/authModel");
const Vendor = require("../models/vendorModel");
const crypto = require("crypto");

// ==================== ADMIN CONTROLLERS ====================

// Get Reward Settings
exports.getRewardSettings = async (req, res) => {
    try {
        let settings = await RewardSettings.findOne().populate("updatedBy", "name email");
        
        if (!settings) {
            // Create default settings if not exists
            settings = await RewardSettings.create({
                referralPoints: 0,
                referralDiscountType: "flat",
                downloadPoints: 0,
                downloadDiscountType: "flat",
            });
        }

        res.status(200).json({
            success: true,
            data: settings,
        });
    } catch (error) {
        console.error("Error fetching reward settings:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch reward settings",
            error: error.message,
        });
    }
};

// Update Reward Settings
exports.updateRewardSettings = async (req, res) => {
    try {
        const { referralPoints, referralDiscountType, downloadPoints, downloadDiscountType, isActive } = req.body;
        const adminId = req.user.id;

        let settings = await RewardSettings.findOne();

        if (!settings) {
            settings = await RewardSettings.create({
                referralPoints,
                referralDiscountType,
                downloadPoints,
                downloadDiscountType,
                isActive,
                updatedBy: adminId,
            });
        } else {
            settings.referralPoints = referralPoints !== undefined ? referralPoints : settings.referralPoints;
            settings.referralDiscountType = referralDiscountType || settings.referralDiscountType;
            settings.downloadPoints = downloadPoints !== undefined ? downloadPoints : settings.downloadPoints;
            settings.downloadDiscountType = downloadDiscountType || settings.downloadDiscountType;
            settings.isActive = isActive !== undefined ? isActive : settings.isActive;
            settings.updatedBy = adminId;

            await settings.save();
        }

        res.status(200).json({
            success: true,
            message: "Reward settings updated successfully",
            data: settings,
        });
    } catch (error) {
        console.error("Error updating reward settings:", error);
        res.status(500).json({
            success: false,
            message: "Failed to update reward settings",
            error: error.message,
        });
    }
};

// Get All Reward Applications (Redemptions)
exports.getAllRewardApplications = async (req, res) => {
    try {
        const { page = 1, limit = 10, status = "", search = "" } = req.query;

        const query = {};
        if (status) {
            query.status = status;
        }

        if (search) {
            query.code = { $regex: search, $options: "i" };
        }

        const applications = await RedeemCode.find(query)
            .populate("userId", "name email phone")
            .populate("appliedBy.vendorId", "name email company")
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort({ createdAt: -1 });

        const count = await RedeemCode.countDocuments(query);

        res.status(200).json({
            success: true,
            data: applications,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            total: count,
        });
    } catch (error) {
        console.error("Error fetching reward applications:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch reward applications",
            error: error.message,
        });
    }
};

// Get Reward Statistics (Admin Dashboard)
exports.getRewardStatistics = async (req, res) => {
    try {
        const totalUsers = await Auth.countDocuments({ role: "user" });
        const usersWithPoints = await RewardPoints.countDocuments({ totalPoints: { $gt: 0 } });
        
        const totalPointsIssued = await RewardPoints.aggregate([
            { $group: { _id: null, total: { $sum: "$totalPoints" } } },
        ]);

        const totalPointsRedeemed = await RewardPoints.aggregate([
            { $group: { _id: null, total: { $sum: "$usedPoints" } } },
        ]);

        const totalReferrals = await RewardPoints.aggregate([
            { $group: { _id: null, total: { $sum: "$referralCount" } } },
        ]);

        const totalRedemptions = await RedeemCode.countDocuments({ status: "used" });
        const activeRedeemCodes = await RedeemCode.countDocuments({ status: "active" });

        res.status(200).json({
            success: true,
            data: {
                totalUsers,
                usersWithPoints,
                totalPointsIssued: totalPointsIssued[0]?.total || 0,
                totalPointsRedeemed: totalPointsRedeemed[0]?.total || 0,
                totalReferrals: totalReferrals[0]?.total || 0,
                totalRedemptions,
                activeRedeemCodes,
            },
        });
    } catch (error) {
        console.error("Error fetching reward statistics:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch reward statistics",
            error: error.message,
        });
    }
};

// Get Vendor Applied Codes History (Admin)
exports.getVendorAppliedCodesAdmin = async (req, res) => {
    try {
        const { vendorId } = req.params;
        const { page = 1, limit = 100 } = req.query;

        if (!vendorId) {
            return res.status(400).json({
                success: false,
                message: "Vendor ID is required",
            });
        }

        const appliedCodes = await RedeemCode.find({
            "appliedBy.vendorId": vendorId,
            status: "used",
        })
            .populate("userId", "name email phone")
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort({ "appliedBy.appliedAt": -1 });

        const count = await RedeemCode.countDocuments({
            "appliedBy.vendorId": vendorId,
            status: "used",
        });

        res.status(200).json({
            success: true,
            data: appliedCodes,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            total: count,
        });
    } catch (error) {
        console.error("Error fetching vendor applied codes:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch vendor applied codes",
            error: error.message,
        });
    }
};

// ==================== USER CONTROLLERS ====================

// Get User Reward Points
exports.getUserRewardPoints = async (req, res) => {
    try {
        const userId = req.user.id;

        let rewardPoints = await RewardPoints.findOne({ userId })
            .populate("userId", "name email phone referralCode")
            .populate("referredUsers.userId", "name email phone");

        if (!rewardPoints) {
            rewardPoints = await RewardPoints.create({
                userId,
                totalPoints: 0,
                availablePoints: 0,
                usedPoints: 0,
                referralCount: 0,
            });
            
            // Populate after creation
            await rewardPoints.populate("userId", "name email phone referralCode");
        }

        res.status(200).json({
            success: true,
            data: rewardPoints,
        });
    } catch (error) {
        console.error("Error fetching user reward points:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch reward points",
            error: error.message,
        });
    }
};

// Get User Reward History
exports.getUserRewardHistory = async (req, res) => {
    try {
        const userId = req.user.id;
        const { page = 1, limit = 20, type = "", source = "" } = req.query;

        const query = { userId };
        if (type) query.type = type;
        if (source) query.source = source;

        const history = await RewardHistory.find(query)
            .populate("referredUserId", "name email phone")
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort({ createdAt: -1 });

        const count = await RewardHistory.countDocuments(query);

        res.status(200).json({
            success: true,
            data: history,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            total: count,
        });
    } catch (error) {
        console.error("Error fetching reward history:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch reward history",
            error: error.message,
        });
    }
};

// Generate Redeem Code
exports.generateRedeemCode = async (req, res) => {
    try {
        const userId = req.user.id;
        const { points } = req.body;

        if (!points || points <= 0) {
            return res.status(400).json({
                success: false,
                message: "Invalid points amount",
            });
        }

        // Get user reward points
        const rewardPoints = await RewardPoints.findOne({ userId });
        if (!rewardPoints || rewardPoints.availablePoints < points) {
            return res.status(400).json({
                success: false,
                message: "Insufficient reward points",
            });
        }

        // Get reward settings to calculate discount
        const settings = await RewardSettings.findOne();
        if (!settings) {
            return res.status(500).json({
                success: false,
                message: "Reward settings not configured",
            });
        }

        // Calculate discount amount
        let discountAmount = 0;
        if (settings.referralDiscountType === "percentage") {
            discountAmount = points; // Points represent percentage
        } else {
            discountAmount = points; // Points represent flat amount
        }

        // Generate unique code
        let code;
        let isUnique = false;
        while (!isUnique) {
            code = crypto.randomBytes(4).toString("hex").toUpperCase();
            const existingCode = await RedeemCode.findOne({ code });
            if (!existingCode) {
                isUnique = true;
            }
        }

        // Create redeem code with 30 minutes expiry
        const expiresAt = new Date(Date.now() + 30 * 60 * 1000);

        const redeemCode = await RedeemCode.create({
            code,
            userId,
            points,
            discountAmount,
            discountType: settings.referralDiscountType,
            expiresAt,
            status: "active",
        });

        res.status(201).json({
            success: true,
            message: "Redeem code generated successfully",
            data: redeemCode,
        });
    } catch (error) {
        console.error("Error generating redeem code:", error);
        res.status(500).json({
            success: false,
            message: "Failed to generate redeem code",
            error: error.message,
        });
    }
};

// Get User Redeem Codes
exports.getUserRedeemCodes = async (req, res) => {
    try {
        const userId = req.user.id;
        const { status = "" } = req.query;

        const query = { userId };
        if (status) query.status = status;

        const redeemCodes = await RedeemCode.find(query)
            .populate("appliedBy.vendorId", "name email company")
            .sort({ createdAt: -1 });

        res.status(200).json({
            success: true,
            data: redeemCodes,
        });
    } catch (error) {
        console.error("Error fetching redeem codes:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch redeem codes",
            error: error.message,
        });
    }
};

// App Download Reward (Called by mobile app)
exports.appDownloadReward = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({
                success: false,
                message: "Email is required",
            });
        }

        // Find user by email
        const user = await Auth.findOne({ email, role: "user" });
        if (!user) {
            return res.status(404).json({
                success: false,
                message: "User not found",
            });
        }

        // Check if user already received download reward
        const existingReward = await RewardHistory.findOne({
            userId: user._id,
            source: "download",
        });

        if (existingReward) {
            return res.status(400).json({
                success: false,
                message: "Download reward already claimed",
            });
        }

        // Get reward settings
        const settings = await RewardSettings.findOne();
        if (!settings || !settings.isActive) {
            return res.status(400).json({
                success: false,
                message: "Reward system is not active",
            });
        }

        const downloadPoints = settings.downloadPoints;
        if (downloadPoints <= 0) {
            return res.status(400).json({
                success: false,
                message: "Download rewards not configured",
            });
        }

        // Get or create reward points
        let rewardPoints = await RewardPoints.findOne({ userId: user._id });
        if (!rewardPoints) {
            rewardPoints = await RewardPoints.create({
                userId: user._id,
                totalPoints: 0,
                availablePoints: 0,
                usedPoints: 0,
            });
        }

        // Add points
        rewardPoints.totalPoints += downloadPoints;
        rewardPoints.availablePoints += downloadPoints;
        await rewardPoints.save();

        // Create history entry
        await RewardHistory.create({
            userId: user._id,
            points: downloadPoints,
            type: "credit",
            source: "download",
            description: "App download reward",
            balanceAfter: rewardPoints.availablePoints,
        });

        res.status(200).json({
            success: true,
            message: "Download reward credited successfully",
            data: {
                pointsEarned: downloadPoints,
                totalPoints: rewardPoints.totalPoints,
                availablePoints: rewardPoints.availablePoints,
            },
        });
    } catch (error) {
        console.error("Error processing download reward:", error);
        res.status(500).json({
            success: false,
            message: "Failed to process download reward",
            error: error.message,
        });
    }
};

// ==================== VENDOR CONTROLLERS ====================

// Verify Redeem Code (without applying)
exports.verifyRedeemCode = async (req, res) => {
    try {
        const vendorId = req.user.id;
        const { code } = req.body;

        if (!code) {
            return res.status(400).json({
                success: false,
                message: "Redeem code is required",
            });
        }

        // Find redeem code
        const redeemCode = await RedeemCode.findOne({ code: code.toUpperCase() }).populate("userId", "name email phone");

        if (!redeemCode) {
            return res.status(404).json({
                success: false,
                message: "Invalid redeem code",
            });
        }

        // Check if already used
        if (redeemCode.status === "used") {
            return res.status(400).json({
                success: false,
                message: "Redeem code already used",
            });
        }

        // Check if expired
        if (redeemCode.status === "expired" || new Date() > redeemCode.expiresAt) {
            return res.status(400).json({
                success: false,
                message: "Redeem code has expired",
            });
        }

        // Get vendor details to check settings
        const vendor = await Vendor.findById(vendorId);
        if (!vendor || !vendor.acceptsRewardPoints || !vendor.rewardSettingsActive) {
            return res.status(400).json({
                success: false,
                message: "Your account is not enabled to accept reward points",
            });
        }

        // Return code details for preview
        res.status(200).json({
            success: true,
            message: "Code verified successfully",
            data: {
                code: redeemCode.code,
                points: redeemCode.points,
                userId: redeemCode.userId,
                expiresAt: redeemCode.expiresAt,
                discountType: vendor.discountType,
                discountAmount: vendor.discountType === "flat" ? redeemCode.points : vendor.discountPercentage,
            },
        });
    } catch (error) {
        console.error("Error verifying redeem code:", error);
        res.status(500).json({
            success: false,
            message: "Failed to verify redeem code",
            error: error.message,
        });
    }
};

// Apply Redeem Code
exports.applyRedeemCode = async (req, res) => {
    try {
        const vendorId = req.user.id;
        const { code } = req.body;

        if (!code) {
            return res.status(400).json({
                success: false,
                message: "Redeem code is required",
            });
        }

        // Find redeem code
        const redeemCode = await RedeemCode.findOne({ code: code.toUpperCase() }).populate("userId", "name email phone");

        if (!redeemCode) {
            return res.status(404).json({
                success: false,
                message: "Invalid redeem code",
            });
        }

        // Check if already used
        if (redeemCode.status === "used") {
            return res.status(400).json({
                success: false,
                message: "Redeem code already used",
            });
        }

        // Check if expired
        if (redeemCode.status === "expired" || new Date() > redeemCode.expiresAt) {
            redeemCode.status = "expired";
            await redeemCode.save();

            return res.status(400).json({
                success: false,
                message: "Redeem code has expired",
            });
        }

        // Get vendor details and check if accepts reward points
        const vendor = await Vendor.findById(vendorId);
        if (!vendor || !vendor.acceptsRewardPoints || !vendor.rewardSettingsActive) {
            return res.status(400).json({
                success: false,
                message: "Your account is not enabled to accept reward points",
            });
        }

        // Calculate discount based on vendor settings
        let discountAmount = 0;
        if (vendor.discountType === "percentage") {
            discountAmount = vendor.discountPercentage;
        } else {
            // Flat discount: 1 point = ₹1
            discountAmount = redeemCode.points;
        }

        // Update redeem code status
        redeemCode.status = "used";
        redeemCode.discountAmount = discountAmount;
        redeemCode.discountType = vendor.discountType;
        redeemCode.appliedBy = {
            vendorId,
            vendorName: vendor.name || vendor.company,
            appliedAt: new Date(),
        };
        await redeemCode.save();

        // Deduct points from user
        const rewardPoints = await RewardPoints.findOne({ userId: redeemCode.userId });
        if (rewardPoints) {
            rewardPoints.availablePoints -= redeemCode.points;
            rewardPoints.usedPoints += redeemCode.points;
            await rewardPoints.save();

            // Create history entry
            await RewardHistory.create({
                userId: redeemCode.userId,
                points: redeemCode.points,
                type: "debit",
                source: "redemption",
                description: `Redeemed at ${vendor.name || vendor.company}`,
                redeemCodeId: redeemCode._id,
                balanceAfter: rewardPoints.availablePoints,
            });
        }

        res.status(200).json({
            success: true,
            message: "Redeem code applied successfully",
            data: {
                code: redeemCode.code,
                discountAmount: discountAmount,
                discountType: vendor.discountType,
                user: redeemCode.userId,
            },
        });
    } catch (error) {
        console.error("Error applying redeem code:", error);
        res.status(500).json({
            success: false,
            message: "Failed to apply redeem code",
            error: error.message,
        });
    }
};

// Get Vendor Applied Codes History
exports.getVendorAppliedCodes = async (req, res) => {
    try {
        const vendorId = req.user.id;
        const { page = 1, limit = 20 } = req.query;

        const appliedCodes = await RedeemCode.find({
            "appliedBy.vendorId": vendorId,
            status: "used",
        })
            .populate("userId", "name email phone")
            .limit(limit * 1)
            .skip((page - 1) * limit)
            .sort({ "appliedBy.appliedAt": -1 });

        const count = await RedeemCode.countDocuments({
            "appliedBy.vendorId": vendorId,
            status: "used",
        });

        res.status(200).json({
            success: true,
            data: appliedCodes,
            totalPages: Math.ceil(count / limit),
            currentPage: page,
            total: count,
        });
    } catch (error) {
        console.error("Error fetching applied codes:", error);
        res.status(500).json({
            success: false,
            message: "Failed to fetch applied codes",
            error: error.message,
        });
    }
};

// Check Vendor Reward Settings
exports.checkVendorRewardSettings = async (req, res) => {
    try {
        const vendorId = req.user.id;

        const vendor = await Vendor.findById(vendorId);

        if (!vendor) {
            return res.status(404).json({
                success: false,
                message: "Vendor not found",
            });
        }

        const vendorSettings = {
            acceptsRewardPoints: vendor.acceptsRewardPoints || false,
            discountType: vendor.discountType || "flat",
            discountPercentage: vendor.discountPercentage || 0,
            maxDiscountAmount: vendor.maxDiscountAmount || 0,
            minOrderValue: vendor.minOrderValue || 0,
            rewardSettingsActive: vendor.rewardSettingsActive || false,
        };

        res.status(200).json({
            success: true,
            data: vendorSettings,
        });
    } catch (error) {
        console.error("Error checking vendor reward settings:", error);
        res.status(500).json({
            success: false,
            message: "Failed to check vendor reward settings",
            error: error.message,
        });
    }
};
