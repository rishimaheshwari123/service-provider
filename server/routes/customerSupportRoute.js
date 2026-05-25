const express = require("express");
const router = express.Router();
const {
    createCustomerSupportCtrl,
    getCustomerSupportCtrl,
    updateSupportStatusCtrl,
} = require("../controllers/customerSupportCtrl");

router.post("/create", createCustomerSupportCtrl);
router.get("/getAll", getCustomerSupportCtrl);
router.put("/update-status/:id", updateSupportStatusCtrl);

module.exports = router;
