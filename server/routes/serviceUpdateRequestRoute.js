const express = require("express");
const {
    createServiceUpdateRequestCtrl,
    createImageUpdateRequestCtrl,
    getPendingServiceUpdateRequestsCtrl,
    getVendorServiceUpdateRequestsCtrl,
    approveServiceUpdateRequestCtrl,
    rejectServiceUpdateRequestCtrl,
} = require("../controllers/serviceUpdateRequestCtrl");

const router = express.Router();

// Vendor routes
router.post("/create-update-request/:id", createServiceUpdateRequestCtrl);
router.post("/create-image-update-request/:id", createImageUpdateRequestCtrl);
router.get("/vendor/:vendorId", getVendorServiceUpdateRequestsCtrl);

// Admin routes
router.get("/pending", getPendingServiceUpdateRequestsCtrl);
router.put("/approve/:id", approveServiceUpdateRequestCtrl);
router.put("/reject/:id", rejectServiceUpdateRequestCtrl);

module.exports = router;