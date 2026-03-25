const express = require("express")
const { createPropertyCtrl, getPropertiesByVendor, updatePropertyCtrl, getPropertiesCtrl, deletePropertyCtrl, getPropertiesByIdCtrl, updatePropertyStatusCtrl, migrateCategoryNamesToIds } = require("../controllers/propertyCtrl")
const router = express.Router()


router.post("/create", createPropertyCtrl)
router.post("/get-vendor-property", getPropertiesByVendor)
router.put('/update/:id', updatePropertyCtrl);
router.put('/update-status/:id', updatePropertyStatusCtrl);
router.get('/getAll', getPropertiesCtrl);
router.get('/get/:id', getPropertiesByIdCtrl);
router.delete('/delete/:id', deletePropertyCtrl);
router.post('/migrate-categories', migrateCategoryNamesToIds);





module.exports = router