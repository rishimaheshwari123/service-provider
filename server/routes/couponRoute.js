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

// Admin routes - add authentication middleware if needed in the future
router.post('/create', createCouponCtrl);
router.get('/getAll', getAllCouponsCtrl);
router.get('/stats', getCouponStatsCtrl);
router.get('/:couponId', getCouponByIdCtrl);
router.put('/:couponId', updateCouponCtrl);
router.delete('/:couponId', deleteCouponCtrl);

// Public routes - for coupon validation and application
router.post('/validate', validateCouponCtrl);
router.post('/apply', applyCouponCtrl);

module.exports = router;