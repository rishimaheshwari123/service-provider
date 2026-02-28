const CommunicationLogs = require("../models/communicationLogs");
const ExcelJS = require('exceljs');

// Get all communication logs with filters
const getAllLogs = async (req, res) => {
  try {
    const { type, purpose, status, startDate, endDate, page = 1, limit = 50 } = req.query;

    const filter = {};

    if (type) filter.type = type;
    if (purpose) filter.purpose = purpose;
    if (status) filter.status = status;

    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    const skip = (page - 1) * limit;

    const [logs, total] = await Promise.all([
      CommunicationLogs.find(filter)
        .populate("userId", "name email")
        .populate("vendorId", "name phone")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      CommunicationLogs.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      logs,
      pagination: {
        total,
        page: parseInt(page),
        pages: Math.ceil(total / limit),
        limit: parseInt(limit),
      },
    });
  } catch (error) {
    console.error("Error fetching communication logs:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch communication logs",
      error: error.message,
    });
  }
};

// Get communication stats
const getStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const filter = {};
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    const stats = await CommunicationLogs.aggregate([
      { $match: filter },
      {
        $group: {
          _id: {
            type: "$type",
            status: "$status",
          },
          count: { $sum: 1 },
          totalCost: { $sum: "$cost" },
        },
      },
      {
        $group: {
          _id: "$_id.type",
          statuses: {
            $push: {
              status: "$_id.status",
              count: "$count",
              totalCost: "$totalCost",
            },
          },
          totalCount: { $sum: "$count" },
          totalCost: { $sum: "$totalCost" },
        },
      },
    ]);

    // Purpose-wise stats
    const purposeStats = await CommunicationLogs.aggregate([
      { $match: filter },
      {
        $group: {
          _id: "$purpose",
          count: { $sum: 1 },
          totalCost: { $sum: "$cost" },
        },
      },
      { $sort: { count: -1 } },
    ]);

    // Overall stats
    const overall = await CommunicationLogs.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          totalMessages: { $sum: 1 },
          totalCost: { $sum: "$cost" },
          successCount: {
            $sum: { $cond: [{ $eq: ["$status", "Success"] }, 1, 0] },
          },
          failedCount: {
            $sum: { $cond: [{ $eq: ["$status", "Failed"] }, 1, 0] },
          },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      stats: {
        byType: stats,
        byPurpose: purposeStats,
        overall: overall[0] || {
          totalMessages: 0,
          totalCost: 0,
          successCount: 0,
          failedCount: 0,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching communication stats:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch communication stats",
      error: error.message,
    });
  }
};

// Download logs as Excel
const downloadLogs = async (req, res) => {
  try {
    const { type, purpose, status, startDate, endDate } = req.query;

    const filter = {};
    if (type) filter.type = type;
    if (purpose) filter.purpose = purpose;
    if (status) filter.status = status;

    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    const logs = await CommunicationLogs.find(filter)
      .populate("userId", "name email")
      .populate("vendorId", "name phone email")
      .sort({ createdAt: -1 })
      .lean();

    // Create Excel workbook
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Communication Logs");

    // Define columns
    worksheet.columns = [
      { header: "Date & Time", key: "createdAt", width: 20 },
      { header: "Type", key: "type", width: 12 },
      { header: "Purpose", key: "purpose", width: 15 },
      { header: "Recipient Name", key: "recipientName", width: 20 },
      { header: "Phone", key: "phone", width: 15 },
      { header: "Email", key: "email", width: 25 },
      { header: "Message", key: "message", width: 50 },
      { header: "Status", key: "status", width: 10 },
      { header: "Provider", key: "provider", width: 20 },
      { header: "Cost (₹)", key: "cost", width: 10 },
      { header: "Error Message", key: "errorMessage", width: 30 },
    ];

    // Add rows
    logs.forEach((log) => {
      worksheet.addRow({
        createdAt: new Date(log.createdAt).toLocaleString("en-IN"),
        type: log.type,
        purpose: log.purpose,
        recipientName: log.recipient?.name || log.vendorId?.name || log.userId?.name || "-",
        phone: log.recipient?.phone || log.vendorId?.phone || "-",
        email: log.recipient?.email || log.vendorId?.email || log.userId?.email || "-",
        message: log.message,
        status: log.status,
        provider: log.provider,
        cost: log.cost,
        errorMessage: log.errorMessage || "-",
      });
    });

    // Style header row
    worksheet.getRow(1).font = { bold: true };
    worksheet.getRow(1).fill = {
      type: "pattern",
      pattern: "solid",
      fgColor: { argb: "FF4472C4" },
    };
    worksheet.getRow(1).font = { color: { argb: "FFFFFFFF" }, bold: true };

    // Set response headers
    res.setHeader(
      "Content-Type",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet"
    );
    res.setHeader(
      "Content-Disposition",
      `attachment; filename=communication-logs-${Date.now()}.xlsx`
    );

    // Write to response
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error("Error downloading communication logs:", error);
    res.status(500).json({
      success: false,
      message: "Failed to download communication logs",
      error: error.message,
    });
  }
};

module.exports = {
  getAllLogs,
  getStats,
  downloadLogs,
};
