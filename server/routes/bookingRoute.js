const express = require("express");
const {
    createBookingCtrl,
    getAllBookingsCtrl,
    getBookingsByVendorCtrl,
    getBookingsByUserCtrl,
    updateBookingStatusCtrl,
} = require("../controllers/bookingCtrl");
const { verifyToken, isAdmin, isVendor, isUser } = require("../utils/verifyToken");

const router = express.Router();

router.post("/create", createBookingCtrl);

// Protected Routes
// Admin can see all bookings
router.get("/getAll", verifyToken, isAdmin, getAllBookingsCtrl);

// Vendor can see only their own bookings
router.get("/get/:vendorId", verifyToken, isVendor, getBookingsByVendorCtrl);

// User can see only their own bookings
router.get("/user/:userId", verifyToken, isUser, getBookingsByUserCtrl);

router.put("/update/:bookingId", updateBookingStatusCtrl);

module.exports = router;
