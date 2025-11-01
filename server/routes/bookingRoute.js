const express = require("express");
const {
    createBookingCtrl,
    getAllBookingsCtrl,
    getBookingsByVendorCtrl,
    updateBookingStatusCtrl,
} = require("../controllers/bookingCtrl");

const router = express.Router();

router.post("/create", createBookingCtrl);
router.get("/getAll", getAllBookingsCtrl);
router.get("/get/:vendorId", getBookingsByVendorCtrl);
router.put("/update/:bookingId", updateBookingStatusCtrl);

module.exports = router;
