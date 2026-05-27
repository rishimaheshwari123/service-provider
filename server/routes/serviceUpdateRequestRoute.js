const express = require("express");
const {
    createServiceUpdateRequestCtrl,
    createImageUpdateRequestCtrl,
    getPendingServiceUpdateRequestsCtrl,
    getVendorServiceUpdateRequestsCtrl,
    approveServiceUpdateRequestCtrl,
    rejectServiceUpdateRequestCtrl,
} = require("../controllers/serviceUpdateRequestCtrl");
const { verifyToken, isAdmin, isVendor } = require("../utils/verifyToken");

const router = express.Router();

// Vendor routes - Protected
router.post("/create-update-request/:id", verifyToken, isVendor, createServiceUpdateRequestCtrl);
router.post("/create-image-update-request/:id", verifyToken, isVendor, createImageUpdateRequestCtrl);
router.get("/vendor/:vendorId", verifyToken, isVendor, getVendorServiceUpdateRequestsCtrl);

// Admin routes - Protected
router.get("/pending", verifyToken, isAdmin, getPendingServiceUpdateRequestsCtrl);
router.put("/approve/:id", verifyToken, isAdmin, approveServiceUpdateRequestCtrl);
router.put("/reject/:id", verifyToken, isAdmin, rejectServiceUpdateRequestCtrl);

module.exports = router;