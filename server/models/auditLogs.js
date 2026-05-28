const mongoose = require("mongoose");

const auditLogSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "auth", // ya User model
            required: false, // Make optional for general inquiries
        },
        propertyId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Property",
            required: false, // Make optional for general inquiries
        },
        type: {
            type: String,
            required: true,
            enum: ["phone", "email", "show_number", "show_provider_number", "inquiry", "booking", "general_contact"]
        },
        details: {
            type: Object, // Store additional details like contact info, booking info, etc.
            required: false
        },
        userInfo: {
            name: String,
            email: String,
            phone: String
        },
        adminComments: [
            {
                comment: {
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
    { timestamps: true }
);

module.exports = mongoose.model("AuditLogs", auditLogSchema);
