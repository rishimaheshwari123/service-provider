const express = require("express")
const { createPropertyCtrl, getPropertiesByVendor, updatePropertyCtrl, vendorUpdatePropertyRequestCtrl, getPropertiesCtrl, deletePropertyCtrl, getPropertiesByIdCtrl, updatePropertyStatusCtrl, migrateCategoryNamesToIds, uploadServiceImageRequestCtrl } = require("../controllers/propertyCtrl")
const { verifyToken, isVendor } = require("../utils/verifyToken")
const router = express.Router()


router.post("/create", verifyToken, createPropertyCtrl)
router.post("/get-vendor-property", getPropertiesByVendor)
router.put('/update/:id', verifyToken, updatePropertyCtrl); // Admin direct update
router.put('/vendor-update/:id', verifyToken, vendorUpdatePropertyRequestCtrl); // Vendor update request
router.put('/update-status/:id', verifyToken, updatePropertyStatusCtrl);
router.put('/upload-service-image/:id', verifyToken, uploadServiceImageRequestCtrl);
router.get('/getAll', getPropertiesCtrl);
router.get('/get/:id', getPropertiesByIdCtrl);
router.delete('/delete/:id', verifyToken ,deletePropertyCtrl);
router.post('/migrate-categories', migrateCategoryNamesToIds);


module.exports = router