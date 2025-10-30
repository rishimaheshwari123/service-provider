const Application = require('../models/careerModel');

// Create a new application
const createApplication = async (req, res) => {
    try {
        const {
            firstName,
            lastName,
            email,
            phone,
            address,
            experience,
            education,
            portfolioLink,
            source,
            job
        } = req.body;

        if (
            !firstName ||
            !lastName ||
            !email ||
            !phone ||
            !address ||
            !experience ||
            !education ||
            !portfolioLink ||
            !source ||
            !job
        ) {
            return res.status(400).json({ success: false, message: "All fields are required." });
        }

        const application = new Application({
            firstName,
            lastName,
            email,
            phone,
            address,
            experience,
            education,
            portfolioLink,
            source,
            job
        });

        await application.save();

        res.status(201).json({
            success: true,
            message: "Application submitted successfully.",
            application
        });
    } catch (error) {
        console.error("Error creating application:", error);
        res.status(500).json({ success: false, message: "Server error." });
    }
};

// Get all applications
const getAllApplications = async (req, res) => {
    try {
        const applications = await Application.find().sort({ createdAt: -1 });
        res.status(200).json({
            success: true,
            applications
        });
    } catch (error) {
        console.error("Error fetching applications:", error);
        res.status(500).json({ success: false, message: "Server error." });
    }
};

module.exports = {
    createApplication,
    getAllApplications
};
