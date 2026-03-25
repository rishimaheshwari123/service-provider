const express = require("express")
const { createPropertyCtrl, getPropertiesByVendor, updatePropertyCtrl, vendorUpdatePropertyRequestCtrl, getPropertiesCtrl, deletePropertyCtrl, getPropertiesByIdCtrl, updatePropertyStatusCtrl, migrateCategoryNamesToIds, uploadServiceImageRequestCtrl } = require("../controllers/propertyCtrl")
const router = express.Router()


router.post("/create", createPropertyCtrl)
router.post("/get-vendor-property", getPropertiesByVendor)
router.put('/update/:id', updatePropertyCtrl); // Admin direct update
router.put('/vendor-update/:id', vendorUpdatePropertyRequestCtrl); // Vendor update request
router.put('/update-status/:id', updatePropertyStatusCtrl);
router.put('/upload-service-image/:id', uploadServiceImageRequestCtrl);
router.get('/getAll', getPropertiesCtrl);
router.get('/get/:id', getPropertiesByIdCtrl);
router.delete('/delete/:id', deletePropertyCtrl);
router.post('/migrate-categories', migrateCategoryNamesToIds);





module.exports = router