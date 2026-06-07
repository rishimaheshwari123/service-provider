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
        phone: {
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
            default: "active"
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
        isCoupen: {
            type: Boolean,
            default: false,
        },
        isLogs: {
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

        // Password Reset Fields
        resetPasswordOTP: {
            type: String,
        },
        resetPasswordOTPExpiry: {
            type: Date,
        },

        // Phone Verification Fields
        phoneVerified: {
            type: Boolean,
            default: false,
        },
        phoneVerificationOTP: {
            type: String,
        },
        phoneVerificationOTPExpiry: {
            type: Date,
        },

        // Referral Fields
        referralCode: {
            type: String,
            unique: true,
            sparse: true,
        },
        referredBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "auth",
        },
        referredByCode: {
            type: String,
        },

        // Firebase Cloud Messaging Token
        fcmToken: {
            type: String,
            default: null,
        },

        // Notification Preferences
        notificationPreferences: {
            bookingUpdates: {
                type: Boolean,
                default: true,
            },
            promotions: {
                type: Boolean,
                default: true,
            },
            reminders: {
                type: Boolean,
                default: true,
            },
            general: {
                type: Boolean,
                default: true,
            },
        },
    },
    { timestamps: true }
);

module.exports = mongoose.model("auth", authSchema);
