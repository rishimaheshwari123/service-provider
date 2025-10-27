const express = require("express")
const { createPropertyCtrl, getPropertiesByVendor, updatePropertyCtrl, getPropertiesCtrl, deletePropertyCtrl, getPropertiesByIdCtrl } = require("../controllers/propertyCtrl")
const router = express.Router()


router.post("/create", createPropertyCtrl)
router.post("/get-vendor-property", getPropertiesByVendor)
router.put('/update/:id', updatePropertyCtrl);
router.get('/getAll', getPropertiesCtrl);
router.get('/get/:id', getPropertiesByIdCtrl);
router.delete('/delete/:id', deletePropertyCtrl);





module.exports = router