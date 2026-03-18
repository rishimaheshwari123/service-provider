const Coupon = require('../models/couponModel');
const AuditLogs = require('../models/auditLogs');

// Create a new coupon
exports.createCouponCtrl = async (req, res) => {
    try {
        const {
            code,
            name,
            description,
            discountType,
            discountValue,
            validFrom,
            validUntil,
            applicableCategories,
            applicableVendors
        } = req.body;

        // Validate required fields
        if (!code || !name || !discountType || !discountValue || !validFrom || !validUntil) {
            return res.status(400).json({
                success: false,
                message: 'Code, name, discount type, discount value, valid from, and valid until are required'
            });
        }

        // Validate discount type and value
        if (!['percentage', 'flat'].includes(discountType)) {
            return res.status(400).json({
                success: false,
                message: 'Discount type must be either "percentage" or "flat"'
            });
        }

        if (discountType === 'percentage' && (discountValue <= 0 || discountValue > 100)) {
            return res.status(400).json({
                success: false,
                message: 'Percentage discount must be between 1 and 100'
            });
        }

        if (discountType === 'flat' && discountValue <= 0) {
            return res.status(400).json({
                success: false,
                message: 'Flat discount must be greater than 0'
            });
        }

        // Validate dates
        const fromDate = new Date(validFrom);
        const untilDate = new Date(validUntil);
        
        if (fromDate >= untilDate) {
            return res.status(400).json({
                success: false,
                message: 'Valid until date must be after valid from date'
            });
        }

        // Check if coupon code already exists
        const existingCoupon = await Coupon.findOne({ code: code.toUpperCase() });
        if (existingCoupon) {
            return res.status(400).json({
                success: false,
                message: 'Coupon code already exists'
            });
        }

        // Create coupon
        const coupon = await Coupon.create({
            code: code.toUpperCase(),
            name,
            description,
            discountType,
            discountValue,
            validFrom: fromDate,
            validUntil: untilDate,
            applicableCategories: applicableCategories || [],
            applicableVendors: applicableVendors || [],
            createdBy: req.body.createdBy || null // Accept createdBy from request body
        });

        // Create audit log
        try {
            await AuditLogs.create({
                userId: req.body.createdBy || null,
                type: 'coupon_management',
                details: {
                    action: 'create_coupon',
                    couponId: coupon._id,
                    couponCode: coupon.code,
                    discountType: coupon.discountType,
                    discountValue: coupon.discountValue
                }
            });
        } catch (auditError) {
            console.error('Failed to create audit log:', auditError);
        }

        res.status(201).json({
            success: true,
            message: 'Coupon created successfully',
            coupon
        });
    } catch (error) {
        console.error('Error creating coupon:', error);
        res.status(500).json({
            success: false,
            message: 'Error creating coupon',
            error: error.message
        });
    }
};

// Get all coupons
exports.getAllCouponsCtrl = async (req, res) => {
    try {
        const { page = 1, limit = 10, status, discountType } = req.query;
        
        const query = {};
        
        // Filter by status
        if (status === 'active') {
            query.isActive = true;
            query.validUntil = { $gte: new Date() };
        } else if (status === 'inactive') {
            query.isActive = false;
        } else if (status === 'expired') {
            query.validUntil = { $lt: new Date() };
        }
        
        // Filter by discount type
        if (discountType && ['percentage', 'flat'].includes(discountType)) {
            query.discountType = discountType;
        }

        const coupons = await Coupon.find(query)
            .populate('createdBy', 'name email')
            .populate('applicableCategories', 'name')
            .populate('applicableVendors', 'name')
            .sort({ createdAt: -1 })
            .limit(limit * 1)
            .skip((page - 1) * limit);

        const total = await Coupon.countDocuments(query);

        res.status(200).json({
            success: true,
            coupons,
            totalPages: Math.ceil(total / limit),
            currentPage: page,
            total
        });
    } catch (error) {
        console.error('Error fetching coupons:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching coupons',
            error: error.message
        });
    }
};

// Get coupon by ID
exports.getCouponByIdCtrl = async (req, res) => {
    try {
        const { couponId } = req.params;
        
        const coupon = await Coupon.findById(couponId)
            .populate('createdBy', 'name email')
            .populate('applicableCategories', 'name')
            .populate('applicableVendors', 'name')
            .populate('usageHistory.user', 'name email')
            .populate('usageHistory.booking');

        if (!coupon) {
            return res.status(404).json({
                success: false,
                message: 'Coupon not found'
            });
        }

        res.status(200).json({
            success: true,
            coupon
        });
    } catch (error) {
        console.error('Error fetching coupon:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching coupon',
            error: error.message
        });
    }
};

// Validate coupon
exports.validateCouponCtrl = async (req, res) => {
    try {
        const { code, amount, userId, categoryId, vendorId } = req.body;

        if (!code || !amount || !userId) {
            return res.status(400).json({
                success: false,
                message: 'Coupon code, amount, and user ID are required'
            });
        }

        const coupon = await Coupon.findOne({ code: code.toUpperCase() });

        if (!coupon) {
            return res.status(404).json({
                success: false,
                message: 'Invalid coupon code'
            });
        }

        // Check if coupon is valid
        if (!coupon.isValid) {
            let message = 'Coupon is not valid';
            if (!coupon.isActive) {
                message = 'Coupon is inactive';
            } else if (coupon.isExpired) {
                message = 'Coupon has expired';
            } else if (new Date() < coupon.validFrom) {
                message = 'Coupon is not yet active';
            }
            
            return res.status(400).json({
                success: false,
                message
            });
        }

        // Check category restriction
        if (coupon.applicableCategories.length > 0 && categoryId) {
            if (!coupon.applicableCategories.includes(categoryId)) {
                return res.status(400).json({
                    success: false,
                    message: 'This coupon is not applicable for the selected category'
                });
            }
        }

        // Check vendor restriction
        if (coupon.applicableVendors.length > 0 && vendorId) {
            if (!coupon.applicableVendors.includes(vendorId)) {
                return res.status(400).json({
                    success: false,
                    message: 'This coupon is not applicable for the selected vendor'
                });
            }
        }

        // Calculate discount
        const discountAmount = coupon.calculateDiscount(amount);
        const finalAmount = amount - discountAmount;

        res.status(200).json({
            success: true,
            message: 'Coupon is valid',
            coupon: {
                id: coupon._id,
                code: coupon.code,
                name: coupon.name,
                discountType: coupon.discountType,
                discountValue: coupon.discountValue
            },
            discountAmount,
            finalAmount,
            originalAmount: amount
        });
    } catch (error) {
        console.error('Error validating coupon:', error);
        res.status(500).json({
            success: false,
            message: 'Error validating coupon',
            error: error.message
        });
    }
};

// Apply coupon (used during booking creation)
exports.applyCouponCtrl = async (req, res) => {
    try {
        const { couponId, userId, bookingId, amount } = req.body;

        const coupon = await Coupon.findById(couponId);
        if (!coupon) {
            return res.status(404).json({
                success: false,
                message: 'Coupon not found'
            });
        }

        const discountAmount = coupon.calculateDiscount(amount);

        // Add to usage history
        coupon.usageHistory.push({
            user: userId,
            booking: bookingId,
            discountAmount,
            usedAt: new Date()
        });

        // Increment used count
        coupon.usedCount += 1;

        await coupon.save();

        // Create audit log
        try {
            await AuditLogs.create({
                userId: userId,
                type: 'coupon_usage',
                details: {
                    action: 'apply_coupon',
                    couponId: coupon._id,
                    couponCode: coupon.code,
                    bookingId,
                    discountAmount,
                    originalAmount: amount,
                    finalAmount: amount - discountAmount
                }
            });
        } catch (auditError) {
            console.error('Failed to create audit log:', auditError);
        }

        res.status(200).json({
            success: true,
            message: 'Coupon applied successfully',
            discountAmount,
            finalAmount: amount - discountAmount
        });
    } catch (error) {
        console.error('Error applying coupon:', error);
        res.status(500).json({
            success: false,
            message: 'Error applying coupon',
            error: error.message
        });
    }
};

// Update coupon
exports.updateCouponCtrl = async (req, res) => {
    try {
        const { couponId } = req.params;
        const updates = req.body;

        // Don't allow updating certain fields if coupon has been used
        const coupon = await Coupon.findById(couponId);
        if (!coupon) {
            return res.status(404).json({
                success: false,
                message: 'Coupon not found'
            });
        }

        if (coupon.usedCount > 0) {
            // Restrict updates for used coupons
            const restrictedFields = ['code', 'discountType', 'discountValue'];
            const hasRestrictedUpdates = restrictedFields.some(field => updates.hasOwnProperty(field));
            
            if (hasRestrictedUpdates) {
                return res.status(400).json({
                    success: false,
                    message: 'Cannot modify discount details of a coupon that has been used'
                });
            }
        }

        // Validate dates if being updated
        if (updates.validFrom || updates.validUntil) {
            const fromDate = new Date(updates.validFrom || coupon.validFrom);
            const untilDate = new Date(updates.validUntil || coupon.validUntil);
            
            if (fromDate >= untilDate) {
                return res.status(400).json({
                    success: false,
                    message: 'Valid until date must be after valid from date'
                });
            }
        }

        const updatedCoupon = await Coupon.findByIdAndUpdate(
            couponId,
            updates,
            { new: true, runValidators: true }
        ).populate('createdBy', 'name email')
         .populate('applicableCategories', 'name')
         .populate('applicableVendors', 'name');

        // Create audit log
        try {
            await AuditLogs.create({
                userId: req.body.userId || null,
                type: 'coupon_management',
                details: {
                    action: 'update_coupon',
                    couponId: updatedCoupon._id,
                    couponCode: updatedCoupon.code,
                    updates: Object.keys(updates)
                }
            });
        } catch (auditError) {
            console.error('Failed to create audit log:', auditError);
        }

        res.status(200).json({
            success: true,
            message: 'Coupon updated successfully',
            coupon: updatedCoupon
        });
    } catch (error) {
        console.error('Error updating coupon:', error);
        res.status(500).json({
            success: false,
            message: 'Error updating coupon',
            error: error.message
        });
    }
};

// Delete coupon
exports.deleteCouponCtrl = async (req, res) => {
    try {
        const { couponId } = req.params;

        const coupon = await Coupon.findById(couponId);
        if (!coupon) {
            return res.status(404).json({
                success: false,
                message: 'Coupon not found'
            });
        }

        // Check if coupon has been used
        if (coupon.usedCount > 0) {
            return res.status(400).json({
                success: false,
                message: 'Cannot delete a coupon that has been used. You can deactivate it instead.'
            });
        }

        await Coupon.findByIdAndDelete(couponId);

        // Create audit log
        try {
            await AuditLogs.create({
                userId: req.body.userId || null,
                type: 'coupon_management',
                details: {
                    action: 'delete_coupon',
                    couponId: couponId,
                    couponCode: coupon.code
                }
            });
        } catch (auditError) {
            console.error('Failed to create audit log:', auditError);
        }

        res.status(200).json({
            success: true,
            message: 'Coupon deleted successfully'
        });
    } catch (error) {
        console.error('Error deleting coupon:', error);
        res.status(500).json({
            success: false,
            message: 'Error deleting coupon',
            error: error.message
        });
    }
};

// Get coupon statistics
exports.getCouponStatsCtrl = async (req, res) => {
    try {
        const totalCoupons = await Coupon.countDocuments();
        const activeCoupons = await Coupon.countDocuments({ 
            isActive: true, 
            validUntil: { $gte: new Date() } 
        });
        const expiredCoupons = await Coupon.countDocuments({ 
            validUntil: { $lt: new Date() } 
        });
        const usedCoupons = await Coupon.countDocuments({ 
            usedCount: { $gt: 0 } 
        });

        // Get total discount given
        const discountStats = await Coupon.aggregate([
            { $unwind: '$usageHistory' },
            { 
                $group: { 
                    _id: null, 
                    totalDiscount: { $sum: '$usageHistory.discountAmount' },
                    totalUsage: { $sum: 1 }
                } 
            }
        ]);

        const totalDiscountGiven = discountStats.length > 0 ? discountStats[0].totalDiscount : 0;
        const totalUsage = discountStats.length > 0 ? discountStats[0].totalUsage : 0;

        res.status(200).json({
            success: true,
            stats: {
                totalCoupons,
                activeCoupons,
                expiredCoupons,
                usedCoupons,
                totalDiscountGiven,
                totalUsage
            }
        });
    } catch (error) {
        console.error('Error fetching coupon stats:', error);
        res.status(500).json({
            success: false,
            message: 'Error fetching coupon statistics',
            error: error.message
        });
    }
};