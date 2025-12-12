const AuditLogs = require("../models/auditLogs");
const Property = require("../models/propertyModel");

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

        const skip = (page - 1) * limit;

        let filter = {};

        if (vendorId) {
            // Find all propertyIds for this vendor
            const properties = await Property.find({ vendor: vendorId }).select("_id");
            const propertyIds = properties.map((p) => p._id);

            filter.propertyId = { $in: propertyIds };
        }

        const logs = await AuditLogs.find(filter)
            .populate("userId", "name email phone") // populate user phone too
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

        res.status(200).json({
            success: true,
            logs,
            total,
            page,
            totalPages: Math.ceil(total / limit),
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Something went wrong" });
    }
};

module.exports = { createAuditCtrl, getAuditLogsCtrl };
