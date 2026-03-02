const SearchLogs = require("../models/searchLogs");
const ExcelJS = require('exceljs');

// Create search log
const createSearchLog = async (req, res) => {
  try {
    const { searchQuery, category, location, page, resultsCount, userId, vendorId } = req.body;

    if (!searchQuery || !page) {
      return res.status(400).json({
        success: false,
        message: "Search query and page are required",
      });
    }

    // Get IP address
    const ipAddress = req.headers['x-forwarded-for'] || req.connection.remoteAddress || req.socket.remoteAddress;
    
    // Get user agent
    const userAgent = req.headers['user-agent'];

    const searchLog = await SearchLogs.create({
      searchQuery,
      category: category || "All Categories",
      location: location || "Unknown",
      page,
      userId: userId || null,
      vendorId: vendorId || null,
      ipAddress,
      userAgent,
      resultsCount: resultsCount || 0,
    });

    res.status(201).json({
      success: true,
      message: "Search log created successfully",
      log: searchLog,
    });
  } catch (error) {
    console.error("Error creating search log:", error);
    res.status(500).json({
      success: false,
      message: "Failed to create search log",
      error: error.message,
    });
  }
};

// Get all search logs with filters
const getAllSearchLogs = async (req, res) => {
  try {
    const { searchQuery, category, page, startDate, endDate, pageNum = 1, limit = 50 } = req.query;

    const filter = {};

    if (searchQuery) filter.searchQuery = { $regex: searchQuery, $options: "i" };
    if (category) filter.category = category;
    if (page) filter.page = page;

    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    const skip = (pageNum - 1) * limit;

    const [logs, total] = await Promise.all([
      SearchLogs.find(filter)
        .populate("userId", "name email phone")
        .populate("vendorId", "name phone")
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(parseInt(limit)),
      SearchLogs.countDocuments(filter),
    ]);

    res.status(200).json({
      success: true,
      logs,
      pagination: {
        total,
        page: parseInt(pageNum),
        pages: Math.ceil(total / limit),
        limit: parseInt(limit),
      },
    });
  } catch (error) {
    console.error("Error fetching search logs:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch search logs",
      error: error.message,
    });
  }
};

// Get search stats
const getSearchStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    const filter = {};
    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    // Top search queries
    const topSearches = await SearchLogs.aggregate([
      { $match: filter },
      {
        $group: {
          _id: "$searchQuery",
          count: { $sum: 1 },
          avgResults: { $avg: "$resultsCount" },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    // Top categories
    const topCategories = await SearchLogs.aggregate([
      { $match: filter },
      {
        $group: {
          _id: "$category",
          count: { $sum: 1 },
        },
      },
      { $sort: { count: -1 } },
      { $limit: 10 },
    ]);

    // Page-wise stats
    const pageStats = await SearchLogs.aggregate([
      { $match: filter },
      {
        $group: {
          _id: "$page",
          count: { $sum: 1 },
          avgResults: { $avg: "$resultsCount" },
        },
      },
    ]);

    // Overall stats
    const overall = await SearchLogs.aggregate([
      { $match: filter },
      {
        $group: {
          _id: null,
          totalSearches: { $sum: 1 },
          avgResults: { $avg: "$resultsCount" },
          uniqueSearches: { $addToSet: "$searchQuery" },
        },
      },
    ]);

    res.status(200).json({
      success: true,
      stats: {
        topSearches,
        topCategories,
        pageStats,
        overall: overall[0] ? {
          totalSearches: overall[0].totalSearches,
          avgResults: overall[0].avgResults,
          uniqueSearches: overall[0].uniqueSearches.length,
        } : {
          totalSearches: 0,
          avgResults: 0,
          uniqueSearches: 0,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching search stats:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch search stats",
      error: error.message,
    });
  }
};

// Download logs as Excel
const downloadSearchLogs = async (req, res) => {
  try {
    const { searchQuery, category, page, startDate, endDate } = req.query;

    const filter = {};
    if (searchQuery) filter.searchQuery = { $regex: searchQuery, $options: "i" };
    if (category) filter.category = category;
    if (page) filter.page = page;

    if (startDate || endDate) {
      filter.createdAt = {};
      if (startDate) filter.createdAt.$gte = new Date(startDate);
      if (endDate) filter.createdAt.$lte = new Date(endDate);
    }

    const logs = await SearchLogs.find(filter)
      .populate("userId", "name email phone")
      .populate("vendorId", "name phone")
      .sort({ createdAt: -1 })
      .lean();

    // Create Excel workbook
    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet("Search Logs");

    // Define columns
    worksheet.columns = [
      { header: "Date & Time", key: "createdAt", width: 20 },
      { header: "Search Query", key: "searchQuery", width: 30 },
      { header: "Category", key: "category", width: 20 },
      { header: "Location", key: "location", width: 15 },
      { header: "Page", key: "page", width: 12 },
      { header: "Results Count", key: "resultsCount", width: 15 },
      { header: "User Name", key: "userName", width: 20 },
      { header: "User Phone", key: "userPhone", width: 15 },
      { header: "User Type", key: "userType", width: 12 },
    ];

    // Add rows
    logs.forEach((log) => {
      worksheet.addRow({
        createdAt: new Date(log.createdAt).toLocaleString("en-IN"),
        searchQuery: log.searchQuery,
        category: log.category,
        location: log.location,
        page: log.page,
        resultsCount: log.resultsCount,
        userName: log.userId?.name || log.vendorId?.name || "Not logged in",
        userPhone: log.userId?.phone || log.vendorId?.phone || "-",
        userType: log.userId ? "User" : log.vendorId ? "Vendor" : "Guest",
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
      `attachment; filename=search-logs-${Date.now()}.xlsx`
    );

    // Write to response
    await workbook.xlsx.write(res);
    res.end();
  } catch (error) {
    console.error("Error downloading search logs:", error);
    res.status(500).json({
      success: false,
      message: "Failed to download search logs",
      error: error.message,
    });
  }
};

module.exports = {
  createSearchLog,
  getAllSearchLogs,
  getSearchStats,
  downloadSearchLogs,
};
