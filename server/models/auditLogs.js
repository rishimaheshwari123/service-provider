const mongoose = require("mongoose");

const auditLogSchema = new mongoose.Schema(
    {
        userId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "auth", // ya User model
            required: true,
        },
        propertyId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Property",
            required: true,
        },
        type: {
            type: String,
        }
    },
    { timestamps: true }
);

module.exports = mongoose.model("AuditLogs", auditLogSchema);
