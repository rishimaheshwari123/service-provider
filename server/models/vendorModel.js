const mongoose = require("mongoose");

const vendorSchema = new mongoose.Schema(
    {
        // Basic Info
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
        
        // New Service Provider Fields
        typeOfService: {
            type: String,
            trim: true,
        },
        category: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Category",
        },
        subCategory: {
            type: String,
            trim: true,
        },
        // Price tier information for selected category
        selectedPriceTier: {
            type: String,
            enum: ["basic", "premium", "premiumPlus"],
            default: "basic",
        },
        selectedPrice: {
            type: Number,
            min: 0,
        },
        yearOfEstablishment: {
            type: String,
            trim: true,
        },
        serviceLocation: {
            type: String,
            trim: true,
        },
        alternatePhone: {
            type: String,
            trim: true,
        },
        whatsappNumber: {
            type: String,
            trim: true,
        },
        businessType: {
            type: String,
            enum: ["Proprietorship", "Partnership", "LLP", "Private Limited", "Other"],
            trim: true,
        },
        gstNumber: {
            type: String,
            trim: true,
        },
        tradeLicense: {
            type: String,
            trim: true,
        },
        numberOfStaff: {
            type: Number,
            default: 0,
        },
        referralCode: {
            type: String,
            trim: true,
        },
        referralName: {
            type: String,
            trim: true,
        },
        workingDaysTimings: {
            type: String,
            trim: true,
        },
         pincode: {
            type: String,
            trim: true,
        },
        
        role: {
            type: String,
            enum: ["vendor"],
            default: "vendor",
        },
        isAdmin: {
            type: Boolean,
            default: false,
        },
        status: {
            type: String,
        },
        holdReason: {
            type: String,
            trim: true,
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
        voterId: {
            type: String,
            trim: true,
        },
        drivingLicence: {
            type: String,
            trim: true,
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

        // Payment Method (Bank or UPI)
        paymentMethod: {
            type: String,
            enum: ["bank", "upi"],
            default: "bank",
        },
        upiId: {
            type: String,
            trim: true,
        },

        // Experience object
        experience: {
            fields: { type: [String], default: [] }, // multiple fields
            totalYears: { type: Number, default: 0 },
        },

        profilePhoto: { type: String, },
        document1: { type: String, },
        document2: { type: String, },
        document3: { type: String, },
        document4: { type: String, },
        document5: { type: String, },

        // Portfolio Images
        portfolioImages: [
            {
                public_id: String,
                url: String,
            },
        ],

        // OTP Verification Fields
        otp: {
            type: String,
        },
        otpExpiry: {
            type: Date,
        },
        isPhoneVerified: {
            type: Boolean,
            default: false,
        },
        isWhatsappVerified: {
            type: Boolean,
            default: false,
        },
        preferredOtpMethod: {
            type: String,
            enum: ["whatsapp", "sms"],
        },

        // Password Reset Fields
        resetPasswordOTP: {
            type: String,
        },
        resetPasswordOTPExpiry: {
            type: Date,
        },

        // Reward Settings
        acceptsRewardPoints: {
            type: Boolean,
            default: false,
        },
        discountType: {
            type: String,
            enum: ["percentage", "flat"],
            default: "flat",
        },
        discountPercentage: {
            type: Number,
            min: 0,
            max: 100,
            default: 0,
        },
        maxDiscountAmount: {
            type: Number,
            min: 0,
            default: 0,
        },
        minOrderValue: {
            type: Number,
            min: 0,
            default: 0,
        },
        rewardSettingsActive: {
            type: Boolean,
            default: false,
        },
        rewardSettingsNotes: {
            type: String,
            default: "",
        },
    },

    { timestamps: true }
);

module.exports = mongoose.model("Vendor", vendorSchema);
