const SystemAuditLog = require("../models/systemAuditLog");

const getAllSystemAuditLogsCtrl = async (req, res) => {
  try {
    const { page = 1, limit = 10 } = req.query;

    const [data, total] = await Promise.all([
      SystemAuditLog.find()
        .select("-password")
        .populate("actorId", "name email")
        .populate("entityId", "name email")
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit),
      SystemAuditLog.countDocuments(),
    ]);

    const totalPages = Math.ceil(total / limit);

    res.status(200).json({
      success: true,
      data,
      pagination: {
        total,
        page,
        limit,
        totalPages,
      },
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

module.exports = {
  getAllSystemAuditLogsCtrl,
};
