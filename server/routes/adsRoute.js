const express = require("express")
const {
  createAdminAdCtrl,
  createVendorAdCtrl,
  getAllAds,
  getManageAds,
  getVendorAds,
  approveVendorAdCtrl,
  rejectVendorAdCtrl,
  toggleAdStatusCtrl,
  deleteAddCtrl,
  updateAddCtrl,
} = require("../controllers/adsCtrl")
const { verifyToken, isAdmin, isVendor } = require("../utils/verifyToken")
const router = express.Router()


router.post("/admin/create", verifyToken, isAdmin, createAdminAdCtrl)
router.post("/vendor/create", verifyToken, isVendor, createVendorAdCtrl)
router.get("/getAll", getAllAds);
router.get("/manage", getManageAds)
router.get("/vendor/:vendorId", getVendorAds)
router.put("/approve/:id", verifyToken, isAdmin, approveVendorAdCtrl)
router.put("/reject/:id", verifyToken, isAdmin, rejectVendorAdCtrl)
router.put("/toggle-status/:id", verifyToken, isAdmin, toggleAdStatusCtrl)
router.delete("/delete/:id", verifyToken, isAdmin, deleteAddCtrl)
router.put("/update/:id", verifyToken, updateAddCtrl)


module.exports = router
