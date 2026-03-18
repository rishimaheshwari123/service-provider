const mongoose = require('mongoose');

const couponSchema = new mongoose.Schema({
    code: {
        type: String,
        required: true,
        unique: true,
        uppercase: true,
        trim: true,
        minlength: 3,
        maxlength: 20
    },
    name: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    discountType: {
        type: String,
        enum: ['percentage', 'flat'],
        required: true
    },
    discountValue: {
        type: Number,
        required: true,
        min: 0
    },
    usedCount: {
        type: Number,
        default: 0
    },
    validFrom: {
        type: Date,
        required: true
    },
    validUntil: {
        type: Date,
        required: true
    },
    isActive: {
        type: Boolean,
        default: true
    },
    applicableCategories: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category'
    }],
    applicableVendors: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Vendor'
    }],
    createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'auth',
        required: false
    },
    usageHistory: [{
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'auth'
        },
        booking: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Booking'
        },
        discountAmount: Number,
        usedAt: {
            type: Date,
            default: Date.now
        }
    }]
}, { timestamps: true });

// Index for better query performance
couponSchema.index({ code: 1 });
couponSchema.index({ validFrom: 1, validUntil: 1 });
couponSchema.index({ isActive: 1 });

// Virtual for checking if coupon is expired
couponSchema.virtual('isExpired').get(function() {
    return new Date() > this.validUntil;
});

// Virtual for checking if coupon is valid (active and not expired)
couponSchema.virtual('isValid').get(function() {
    return this.isActive && !this.isExpired && new Date() >= this.validFrom;
});

// Method to check if user can use this coupon
couponSchema.methods.canUserUse = function(userId) {
    // Since we removed user usage limit, any user can use the coupon
    return true;
};

// Method to calculate discount amount
couponSchema.methods.calculateDiscount = function(amount) {
    let discount = 0;
    if (this.discountType === 'percentage') {
        discount = (amount * this.discountValue) / 100;
    } else if (this.discountType === 'flat') {
        discount = this.discountValue;
        if (discount > amount) {
            discount = amount; // Can't discount more than the total amount
        }
    }

    return Math.round(discount * 100) / 100; // Round to 2 decimal places
};

module.exports = mongoose.model('Coupon', couponSchema);