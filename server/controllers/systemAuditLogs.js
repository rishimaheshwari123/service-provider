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
        .limit(Number(limit))
        .lean(),
      SystemAuditLog.countDocuments(),
    ]);

    const sanitizedData = data.map((log) => {
      if (log.changes) {
        if (log.changes.oldData && log.changes.oldData.password) {
          delete log.changes.oldData.password;
        }
        if (log.changes.newData && log.changes.newData.password) {
          delete log.changes.newData.password;
        }
      }
      return log;
    });

    const totalPages = Math.ceil(total / Number(limit));

    res.status(200).json({
      success: true,
      data: sanitizedData,
      pagination: {
        total,
        page,
        limit,
        totalPages,
      },
    });
  } catch (error) {
    console.error(error);
    res
      .status(500)
      .json({
        success: false,
        message: "Failed to fetch system audit logs",
        error: error.message,
      });
  }
};

module.exports = {
  getAllSystemAuditLogsCtrl,
};
