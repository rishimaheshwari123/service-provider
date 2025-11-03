const mongoose = require("mongoose");

const authSchema = new mongoose.Schema(
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

        role: {
            type: String,
            enum: ["user", "admin"],
            default: "user",
        },

        token: {
            type: String,
        },

        type: {
            type: String,
        },

        isVendor: {
            type: Boolean,
            default: false,
        },

        isBlog: {
            type: Boolean,
            default: false,
        },

        isUser: {
            type: Boolean,
            default: false,
        },

        isSupport: {
            type: Boolean,
            default: false,
        },

        isJob: {
            type: Boolean,
            default: false,
        },

        isAds: {
            type: Boolean,
            default: false,
        },

        isBooking: {
            type: Boolean,
            default: false,
        },

        isEmpManage: {
            type: Boolean,
            default: false,
        },

        isCategoryManage: {
            type: Boolean,
            default: false,
        },

        isManageService: {
            type: Boolean,
            default: false,
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("auth", authSchema);
