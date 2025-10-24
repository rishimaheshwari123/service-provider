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
            // default: false
        },
        percentage: {
            type: String,
            // default: false
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
    },
    { timestamps: true }
);

module.exports = mongoose.model("Vendor", vendorSchema);
