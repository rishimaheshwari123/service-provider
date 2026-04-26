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
const router = express.Router()


router.post("/admin/create", createAdminAdCtrl)
router.post("/vendor/create", createVendorAdCtrl)
router.get("/getAll", getAllAds)
router.get("/manage", getManageAds)
router.get("/vendor/:vendorId", getVendorAds)
router.put("/approve/:id", approveVendorAdCtrl)
router.put("/reject/:id", rejectVendorAdCtrl)
router.put("/toggle-status/:id", toggleAdStatusCtrl)
router.delete("/delete/:id", deleteAddCtrl)
router.put("/update/:id", updateAddCtrl)


module.exports = router
