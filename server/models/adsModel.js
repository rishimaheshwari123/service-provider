const mongoose = require("mongoose");

const adsSchema = new mongoose.Schema(
    {
        image: {
            type: String,
            required: true,
            trim: true,
        },

        url: {
            type: String,
            required: true,
            trim: true,
        },
        createdByType: {
            type: String,
            enum: ["admin", "vendor"],
            default: "admin",
            index: true,
        },
        adminId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "auth",
            default: null,
            index: true,
        },
        vendorId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Vendor",
            default: null,
            index: true,
        },
        approvalStatus: {
            type: String,
            enum: ["pending", "approved", "rejected"],
            default: "approved",
            index: true,
        },
        isActive: {
            type: Boolean,
            default: true,
            index: true,
        },
        approvedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "auth",
            default: null,
        },
        approvedAt: {
            type: Date,
            default: null,
        },
        rejectionReason: {
            type: String,
            trim: true,
            default: "",
        },

    },
    { timestamps: true }
);

module.exports = mongoose.model("Ads", adsSchema);
