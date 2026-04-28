const jwt = require("jsonwebtoken");
const Auth = require("../models/authModel");
const Vendor = require("../models/vendorModel");

// Verify JWT Token
exports.verifyToken = async (req, res, next) => {
    try {
        const token = req.headers.authorization?.split(" ")[1] || req.cookies.token || req.body.token;

        if (!token) {
            return res.status(401).json({
                success: false,
                message: "Token is missing",
            });
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            req.user = decoded;
            next();
        } catch (error) {
            return res.status(401).json({
                success: false,
                message: "Invalid token",
            });
        }
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error verifying token",
            error: error.message,
        });
    }
};

// Check if user is Admin
exports.isAdmin = async (req, res, next) => {
    try {
        const user = await Auth.findById(req.user.id);

        if (!user || user.role !== "admin") {
            return res.status(403).json({
                success: false,
                message: "Access denied. Admin only.",
            });
        }

        next();
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error checking admin role",
            error: error.message,
        });
    }
};

// Check if user is Vendor
exports.isVendor = async (req, res, next) => {
    try {
        const vendor = await Vendor.findById(req.user.id);

        if (!vendor || vendor.role !== "vendor") {
            return res.status(403).json({
                success: false,
                message: "Access denied. Vendor only.",
            });
        }

        next();
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error checking vendor role",
            error: error.message,
        });
    }
};

// Check if user is User (not admin)
exports.isUser = async (req, res, next) => {
    try {
        const user = await Auth.findById(req.user.id);

        if (!user || user.role !== "user") {
            return res.status(403).json({
                success: false,
                message: "Access denied. User only.",
            });
        }

        next();
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Error checking user role",
            error: error.message,
        });
    }
};
