const mongoose = require("mongoose");

const vendorSchema = new mongoose.Schema(
    {
        name: {
            type: String,
            trim: true,
        },
        email: {
            type: String,
        },
        password: {
            type: String,
            trim: true,
        },
        phone: {
            type: String,
            trim: true,
        },
        company: {
            type: String,
            trim: true,
        },
        address: {
            type: String,
            trim: true,
        },
        description: {
            type: String,
            trim: true,
        },
        role: {
            type: String,
            enum: ["vendor"],
            default: "vendor",
        },
        status: {
            type: String,
        },
        percentage: {
            type: String,
        },
        adhar: {
            type: String,
        },
        pan: {
            type: String,
        },
        token: {
            type: String,
        },
        updateProfileRequest: {
            type: String,
            enum: ["pending", "requested", "approved"],
            default: "pending",
        },
        // New field for working hours with available
        workingHours: {
            monday: { start: String, end: String, available: { type: Boolean, default: true } },
            tuesday: { start: String, end: String, available: { type: Boolean, default: true } },
            wednesday: { start: String, end: String, available: { type: Boolean, default: true } },
            thursday: { start: String, end: String, available: { type: Boolean, default: true } },
            friday: { start: String, end: String, available: { type: Boolean, default: true } },
            saturday: { start: String, end: String, available: { type: Boolean, default: true } },
            sunday: { start: String, end: String, available: { type: Boolean, default: false } }, // default not available
        },
        bankDetail: {
            accountNumber: { type: String, trim: true },
            IFSC: { type: String, trim: true },
            accountHolderName: { type: String, trim: true },
            branch: { type: String, trim: true },
        },

        // Experience object
        experience: {
            fields: { type: [String], default: [] }, // multiple fields
            totalYears: { type: Number, default: 0 },
        },

        profilePhoto: { type: String, },
        document1: { type: String, },
        document2: { type: String, },
    },

    { timestamps: true }
);

module.exports = mongoose.model("Vendor", vendorSchema);
