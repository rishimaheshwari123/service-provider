const express = require("express")
const { registerCtrl, loginCtrl, getAllUsers, editPermissionCtrl, deleteAuthCtrl, getUserInquiries, changeUserTypeCtrl, changePasswordCtrl, forgotPasswordCtrl, verifyResetOTPCtrl, resetPasswordCtrl, generateReferralCodeCtrl } = require("../controllers/authCtrl")
const { verifyToken, isAdmin } = require("../utils/verifyToken")
const router = express.Router()


router.post("/login", loginCtrl)
router.post("/register", registerCtrl)
router.post("/forgot-password", forgotPasswordCtrl)
router.post("/verify-reset-otp", verifyResetOTPCtrl)
router.post("/reset-password", resetPasswordCtrl)
router.post("/generate-referral-code", generateReferralCodeCtrl)

// Protected Admin Route - Only Admin can get all users
router.get("/getAll", verifyToken, isAdmin, getAllUsers)

router.put("/update/:id", editPermissionCtrl)
router.delete("/delete/:id", deleteAuthCtrl)
router.get("/my-profile/:id", getUserInquiries)
router.put("/change-type/:id", changeUserTypeCtrl);
router.put("/change-password/:id", changePasswordCtrl);




module.exports = router