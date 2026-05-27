const express = require('express');
const router = express.Router();
const {
    createCouponCtrl,
    getAllCouponsCtrl,
    getCouponByIdCtrl,
    validateCouponCtrl,
    applyCouponCtrl,
    updateCouponCtrl,
    deleteCouponCtrl,
    getCouponStatsCtrl
} = require('../controllers/couponCtrl');
const { verifyToken, isAdmin } = require('../utils/verifyToken');

// Protected Admin routes - Only Admin can manage coupons
router.post('/create', verifyToken, isAdmin, createCouponCtrl);
router.get('/getAll', verifyToken, isAdmin, getAllCouponsCtrl);
router.get('/stats', verifyToken, isAdmin, getCouponStatsCtrl);
router.get('/:couponId', verifyToken, isAdmin, getCouponByIdCtrl);
router.put('/:couponId', verifyToken, isAdmin, updateCouponCtrl);
router.delete('/:couponId', verifyToken, isAdmin, deleteCouponCtrl);

// Public routes - for coupon validation and application
router.post('/validate', validateCouponCtrl);
router.post('/apply', applyCouponCtrl);

module.exports = router;