const express = require("express");
const router = express.Router();
const {
  createProfileUpdateRequest,
  getPendingUpdateRequests,
  getUpdateRequestByVendorId,
  approveUpdateRequest,
  rejectUpdateRequest,
} = require("../controllers/vendorProfileUpdateRequestCtrl");

// Create/update profile update request
router.post("/:id", createProfileUpdateRequest);

// Get all pending requests (admin)
router.get("/pending", getPendingUpdateRequests);

// Get request by vendor ID
router.get("/vendor/:vendorId", getUpdateRequestByVendorId);

// Approve request (admin)
router.put("/approve/:requestId", approveUpdateRequest);

// Reject request (admin)
router.put("/reject/:requestId", rejectUpdateRequest);

module.exports = router;
