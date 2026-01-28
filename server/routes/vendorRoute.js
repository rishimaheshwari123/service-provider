const express = require("express")
const { vendorLoginCtrl, vendorRegisterCtrl, getAllVendorCtrl, updateVendorStatusCtrl, getVendorByIDCtrl, updateVendorProfileCtrl, updateVendorPercentageCtrl, updateWorkingHours, requestProfileUpdateCtrl, deleteVendorCtrl } = require("../controllers/vendorCtrl")
const router = express.Router()


router.post("/login", vendorLoginCtrl)
router.post("/register", vendorRegisterCtrl)
router.get("/getAll", getAllVendorCtrl)
router.get("/get/:id", getVendorByIDCtrl)
router.put("/update/:id", updateVendorStatusCtrl)
router.put("/update-profile/:id", updateVendorProfileCtrl)
router.put("/update-percentage/:id", updateVendorPercentageCtrl)
router.put("/working-hours/:id", updateWorkingHours);
router.post("/request-update/:id", requestProfileUpdateCtrl);
router.delete("/delete/:id", deleteVendorCtrl);



module.exports = router