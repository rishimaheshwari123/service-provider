const express = require("express");
const router = express.Router();
const {
  createProfileUpdateRequest,
  getPendingUpdateRequests,
  getUpdateRequestByVendorId,
  approveUpdateRequest,
  rejectUpdateRequest,
} = require("../controllers/vendorProfileUpdateRequestCtrl");
const { verifyToken, isVendor, isAdmin } = require("../utils/verifyToken");

// Create/update profile update request
router.post("/:id", verifyToken, isVendor, createProfileUpdateRequest);

// Get all pending requests (admin)
router.get("/pending", verifyToken, isAdmin, getPendingUpdateRequests);

// Get request by vendor ID
router.get("/vendor/:vendorId", verifyToken, isVendor, getUpdateRequestByVendorId);

// Approve request (admin)
router.put("/approve/:requestId", verifyToken, isAdmin, approveUpdateRequest);

// Reject request (admin)
router.put("/reject/:requestId", verifyToken, isAdmin, rejectUpdateRequest);

module.exports = router;
