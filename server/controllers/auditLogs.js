const AuditLogs = require("../models/auditLogs");
const Property = require("../models/propertyModel");
const RewardSettings = require("../models/rewardSettingsModel");
const RewardPoints = require("../models/rewardPointsModel");
const RewardHistory = require("../models/rewardHistoryModel");

const createAuditCtrl = async (req, res) => {
    try {
        const { id } = req.params;
        const { userId } = req.query;
        const { type } = req.body;

        if (!userId || !id) {
            return res.status(400).json({ success: false, message: "userId and propertyId are required" });
        }

        // Direct save audit log
        const auditLog = await AuditLogs.create({
            userId,
            propertyId: id,
            type
        });

        // Award phone call reward points if type is "phone"
        if (type === "phone" || type ==="show_number") {
            try {
                const rewardSettings = await RewardSettings.findOne();
                
                if (rewardSettings && rewardSettings.isActive && rewardSettings.phoneCallPoints > 0) {
                    console.log(`📞 Processing phone call reward for user ${userId}`);
                    
                    // Get property details for reward history
                    const property = await Property.findById(id).select('title');
                    
                    // Get or create reward points record
                    let userRewardPoints = await RewardPoints.findOne({ userId });
                    
                    if (!userRewardPoints) {
                        userRewardPoints = await RewardPoints.create({
                            userId,
                            totalPoints: 0,
                            availablePoints: 0,
                        });
                    }
                    
                    // Add phone call points
                    const pointsToAdd = rewardSettings.phoneCallPoints;
                    userRewardPoints.totalPoints += pointsToAdd;
                    userRewardPoints.availablePoints += pointsToAdd;
                    await userRewardPoints.save();
                    
                    // Create reward history entry
                    await RewardHistory.create({
                        userId,
                        type: "credit",
                        source: "phone_call",
                        points: pointsToAdd,
                        description: `Phone call reward for service: ${property?.title || 'Service'}`,
                        referenceId: auditLog._id,
                        referenceModel: "AuditLogs",
                        balanceAfter: userRewardPoints.availablePoints,
                    });
                    
                    console.log(`✅ Awarded ${pointsToAdd} phone call reward points to user ${userId}`);
                } else {
                    console.log('ℹ️ Phone call rewards not active or not configured');
                }
            } catch (rewardError) {
                console.error('❌ Failed to process phone call reward:', rewardError);
                // Don't fail the audit log if reward fails
            }
        }

        res.status(201).json({
            success: true,
            message: "Audit log created successfully",
            auditLog
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Something went wrong" });
    }
};

const getAuditLogsCtrl = async (req, res) => {
    try {
        const limit = parseInt(req.query.limit) || 50;
        const page = parseInt(req.query.page) || 1;
        const vendorId = req.query.vendorId;
        const type = req.query.type;

        const skip = (page - 1) * limit;

        let filter = {
            type: { $ne: "general_contact" } // exclude general_contact
        };

        // Filter by type if provided
        if (type && type !== "general_contact") {
            filter.type = type;
        }

        if (vendorId) {
            // Find all propertyIds for this vendor
            const properties = await Property.find({ vendor: vendorId }).select("_id");

            const propertyIds = properties.map((p) => p._id);

            filter.propertyId = { $in: propertyIds };
        }

        const logs = await AuditLogs.find(filter)
            .populate("userId", "name email phone")
            .populate({
                path: "propertyId",
                select: "title vendor",
                populate: {
                    path: "vendor",
                    select: "name company phone",
                },
            })
            .sort({ createdAt: -1 })
            .skip(skip)
            .limit(limit);

        const total = await AuditLogs.countDocuments(filter);

        // Get counts by type for dashboard
        const aggregateMatch = {
            type: { $ne: "general_contact" }
        };

        if (vendorId) {
            const properties = await Property.find({ vendor: vendorId }).select("_id");

            aggregateMatch.propertyId = {
                $in: properties.map((p) => p._id)
            };
        }

        const typeCounts = await AuditLogs.aggregate([
            { $match: aggregateMatch },
            {
                $group: {
                    _id: "$type",
                    count: { $sum: 1 }
                }
            }
        ]);

        res.status(200).json({
            success: true,
            logs,
            total,
            page,
            totalPages: Math.ceil(total / limit),
            typeCounts: typeCounts.reduce((acc, item) => {
                acc[item._id] = item.count;
                return acc;
            }, {})
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Something went wrong"
        });
    }
};

module.exports = { createAuditCtrl, getAuditLogsCtrl };
