const AuditLogs = require("../models/auditLogs");
const Property = require("../models/propertyModel");
const RewardSettings = require("../models/rewardSettingsModel");
const RewardPoints = require("../models/rewardPointsModel");
const RewardHistory = require("../models/rewardHistoryModel");
const Auth = require("../models/authModel");

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
        if (type === "phone" || type === "show_number") {
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
        const searchQuery = req.query.searchQuery;
        const vendorId = req.query.vendorId;
        const type = req.query.type;
        const skip = (page - 1) * limit;

        let matchStage = {
            type: { $ne: "general_contact" }
        };

        if (type && type !== "general_contact") {
            matchStage.type = type;
        }

        // Vendor filter
        let propertyIds = [];
        if (vendorId) {
            const properties = await Property.find({ vendor: vendorId }).select("_id");
            propertyIds = properties.map(p => p._id);

            matchStage.propertyId = { $in: propertyIds };
        }

        const pipeline = [
            { $match: matchStage },
            {
                $lookup: {
                    from: "auths",
                    localField: "userId",
                    foreignField: "_id",
                    as: "userId"
                }
            },
            { $unwind: { path: "$userId", preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: "properties",
                    localField: "propertyId",
                    foreignField: "_id",
                    as: "propertyId"
                }
            },
            { $unwind: { path: "$propertyId", preserveNullAndEmptyArrays: true } },
            {
                $lookup: {
                    from: "vendors",
                    localField: "propertyId.vendor",
                    foreignField: "_id",
                    as: "propertyId.vendor"
                }
            },
            { $unwind: { path: "$propertyId.vendor", preserveNullAndEmptyArrays: true } },
            ...(searchQuery ? [{
                $match: {
                    $or: [
                        { type: { $regex: searchQuery, $options: "i" } },
                        { "userId.name": { $regex: searchQuery, $options: "i" } },
                        { "userId.email": { $regex: searchQuery, $options: "i" } },
                        { "userId.phone": { $regex: searchQuery, $options: "i" } },
                        { "propertyId.title": { $regex: searchQuery, $options: "i" } },
                        { "propertyId.vendor.name": { $regex: searchQuery, $options: "i" } }
                    ]
                }
            }] : []),

            {
                $facet: {
                    logs: [
                        { $sort: { createdAt: -1 } },
                        { $skip: skip },
                        { $limit: limit }
                    ],

                    totalCount: [
                        { $count: "count" }
                    ],

                    typeCounts: [
                        {
                            $group: {
                                _id: "$type",
                                count: { $sum: 1 }
                            }
                        }
                    ],

                    summary: [
                        {
                            $group: {
                                _id: null,
                                uniqueUsers: { $addToSet: "$userId._id" },
                                uniqueProperties: { $addToSet: "$propertyId._id" },
                                totalLogs: { $sum: 1 }
                            }
                        }
                    ]
                }
            }
        ];

        const result = await AuditLogs.aggregate(pipeline);

        const logs = result[0].logs;
        const total = result[0].totalCount[0]?.count || 0;

        const typeCountsMap = {};
        result[0].typeCounts.forEach(t => {
            typeCountsMap[t._id] = t.count;
        });

        const summaryData = result[0].summary[0] || {};

        res.status(200).json({
            success: true,
            logs,
            total,
            page,
            totalPages: Math.ceil(total / limit),
            typeCounts: typeCountsMap,
            summary: {
                totalLogsInDatabase: total,
                uniqueActiveUsers: summaryData.uniqueUsers?.length || 0,
                uniquePropertiesClicked: summaryData.uniqueProperties?.length || 0
            }
        });

    } catch (error) {
        console.error(error);
        res.status(500).json({
            success: false,
            message: "Something went wrong"
        });
    }
};

const addAdminCommentCtrl = async (req, res) => {
    try {
        const { id } = req.params;
        const { comment, adminId } = req.body;

        if (!comment || !adminId) {
            return res.status(400).json({
                success: false,
                message: "Comment and adminId are required.",
            });
        }

        // Get admin details
        const admin = await Auth.findById(adminId);
        if (!admin) {
            return res.status(404).json({
                success: false,
                message: "Admin not found.",
            });
        }

        // Add comment to audit log
        const updatedLog = await AuditLogs.findByIdAndUpdate(
            id,
            {
                $push: {
                    adminComments: {
                        comment,
                        adminId,
                        adminName: admin.name,
                        createdAt: new Date(),
                    },
                },
            },
            { new: true }
        )
            .populate("userId", "name email phone")
            .populate({
                path: "propertyId",
                select: "title vendor",
                populate: {
                    path: "vendor",
                    select: "name company phone",
                },
            })
            .populate("adminComments.adminId", "name email");

        if (!updatedLog) {
            return res.status(404).json({
                success: false,
                message: "Audit log not found.",
            });
        }

        return res.status(200).json({
            success: true,
            message: "Admin comment added successfully.",
            data: updatedLog,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to add admin comment.",
            error: error.message,
        });
    }
};

module.exports = { createAuditCtrl, getAuditLogsCtrl, addAdminCommentCtrl };
