const User = require("../models/authModel");
const Vendor = require("../models/vendorModel");
const Service = require("../models/propertyModel");
const Inquiry = require("../models/contactModel");

exports.getCountsCtrl = async (req, res) => {
    try {
        // parallel queries for speed
        const [usersCount, vendorsCount, servicesCount, inquiriesCount] =
            await Promise.all([
                User.countDocuments({}),
                Vendor.countDocuments({}),
                Service.countDocuments({}),
                Inquiry.countDocuments({})
            ]);

        return res.status(200).json({
            success: true,
            data: {
                users: usersCount,
                vendors: vendorsCount,
                services: servicesCount,
                inquiries: inquiriesCount,
            },
        });
    } catch (error) {
        console.error("getCountsCtrl error:", error);
        return res.status(500).json({
            success: false,
            message: "Server error while fetching counts",
            error: error.message,
        });
    }
};



exports.getVendorDashboardCtrl = async (req, res) => {
    try {
        const { id } = req.params; // vendor id

        if (!id) {
            return res.status(400).json({
                success: false,
                message: "Vendor ID is required",
            });
        }

        // Count total services by vendor
        const totalServices = await Service.countDocuments({ vendor: id });

        // Count total inquiries for vendor
        const totalInquiries = await Inquiry.countDocuments({ vendor: id });

        return res.status(200).json({
            success: true,
            data: {
                totalServices,
                totalInquiries,
            },
        });
    } catch (error) {
        console.error("Error in getVendorDashboardCtrl:", error);
        return res.status(500).json({
            success: false,
            message: "Server error while fetching vendor dashboard data",
            error: error.message,
        });
    }
};
