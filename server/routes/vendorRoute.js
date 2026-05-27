const express = require("express")
const { vendorLoginCtrl, vendorRegisterCtrl, getAllVendorCtrl, getAllVendorPaginatedCtrl, updateVendorStatusCtrl, getVendorByIDCtrl, updateVendorProfileCtrl, updateVendorPercentageCtrl, updateWorkingHours, requestProfileUpdateCtrl, deleteVendorCtrl, sendVendorOTP, verifyVendorOTP, vendorForgotPasswordCtrl, vendorVerifyResetOTPCtrl, vendorResetPasswordCtrl, adminResetVendorPasswordCtrl, updateVendorProfileImageCtrl, updateVendorRewardSettingsCtrl } = require("../controllers/vendorCtrl")
const { verifyToken, isAdmin } = require("../utils/verifyToken")
const router = express.Router()


router.post("/login", vendorLoginCtrl)
router.post("/register", vendorRegisterCtrl)
router.post("/send-otp", sendVendorOTP)
router.post("/verify-otp", verifyVendorOTP)
router.post("/forgot-password", vendorForgotPasswordCtrl)
router.post("/verify-reset-otp", vendorVerifyResetOTPCtrl)
router.post("/reset-password", vendorResetPasswordCtrl)
router.post("/admin-reset-password", adminResetVendorPasswordCtrl)

// Protected Admin Routes - Only Admin can access all vendors
router.get("/getAll", verifyToken, isAdmin, getAllVendorCtrl)
router.get("/getAllPaginated", verifyToken, isAdmin, getAllVendorPaginatedCtrl)

router.get("/get/:id", getVendorByIDCtrl)
router.put("/update/:id", updateVendorStatusCtrl)
router.put("/update-profile/:id", updateVendorProfileCtrl)
router.put("/update-percentage/:id", updateVendorPercentageCtrl)
router.put("/working-hours/:id", updateWorkingHours);
router.post("/request-update/:id", requestProfileUpdateCtrl);
router.delete("/delete/:id", deleteVendorCtrl);
router.put("/upload-profile-image/:id", updateVendorProfileImageCtrl);
router.put("/update-reward-settings/:id", updateVendorRewardSettingsCtrl);

module.exports = router
