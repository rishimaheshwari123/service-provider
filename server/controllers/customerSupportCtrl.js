const CustomerSupport = require("../models/customerSupport");

const createCustomerSupportCtrl = async (req, res) => {
    try {
        const { name, email, subject, category, message } = req.body;

        if (!name || !email || !subject || !category || !message) {
            return res.status(400).json({ success: false, message: "All fields are required." });
        }

        const newSupport = await CustomerSupport.create({
            name,
            email,
            subject,
            category,
            message,
        });

        return res.status(201).json({
            success: true,
            message: "Support request created successfully.",
            data: newSupport,
        });
    } catch (error) {
        return res.status(500).json({
            success: false,
            message: "Failed to create support request.",
            error: error.message,
        });
    }
};

const getCustomerSupportCtrl = async (req, res) => {
    try {
        const supportRequests = await CustomerSupport.find().sort({ createdAt: -1 });

        return res.status(200).json({
            message: "Support requests fetched successfully.",
            data: supportRequests,
            success: true,
        });
    } catch (error) {
        return res.status(500).json({
            message: "Failed to fetch support requests.",
            error: error.message,
            success: false
        });
    }
};

module.exports = {
    createCustomerSupportCtrl,
    getCustomerSupportCtrl,
};
