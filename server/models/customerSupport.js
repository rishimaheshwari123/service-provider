const mongoose = require("mongoose");

const customerSupportSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            required: true,
            trim: true,
        },
        email: {
            type: String,
            required: true,
            trim: true,
            lowercase: true,
        },
        subject: {
            type: String,
            required: true,
            trim: true,
        },
        category: {
            type: String,
            required: true,
            trim: true,
        },
        message: {
            type: String,
            required: true,
            trim: true,
        },
        status: {
            type: String,
            enum: ["in_progress", "resolved", "rejected"],
            default: "in_progress",
        },
        adminRemarks: [
            {
                remark: {
                    type: String,
                    required: true,
                    trim: true,
                },
                adminId: {
                    type: mongoose.Schema.Types.ObjectId,
                    ref: "auth",
                    required: true,
                },
                adminName: {
                    type: String,
                    required: true,
                },
                createdAt: {
                    type: Date,
                    default: Date.now,
                },
            },
        ],
    },
    {
        timestamps: true, // Adds createdAt and updatedAt
    }
);

module.exports = mongoose.model("CustomerSupport", customerSupportSchema);
