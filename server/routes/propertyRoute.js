const express = require("express")
const { createPropertyCtrl, getPropertiesByVendor, updatePropertyCtrl, getPropertiesCtrl, deletePropertyCtrl, getPropertiesByIdCtrl, updatePropertyStatusCtrl } = require("../controllers/propertyCtrl")
const router = express.Router()


router.post("/create", createPropertyCtrl)
router.post("/get-vendor-property", getPropertiesByVendor)
router.put('/update/:id', updatePropertyCtrl);
router.put('/update-status/:id', updatePropertyStatusCtrl);
router.get('/getAll', getPropertiesCtrl);
router.get('/get/:id', getPropertiesByIdCtrl);
router.delete('/delete/:id', deletePropertyCtrl);





module.exports = router