const express = require("express")
const { createContactCtrl, getContactsByVendorCtrl } = require("../controllers/contactCtrl")
const router = express.Router()


router.post("/create", createContactCtrl)
router.get("/getAll/:id", getContactsByVendorCtrl)





module.exports = router