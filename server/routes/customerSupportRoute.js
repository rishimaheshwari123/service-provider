const express = require("express");
const router = express.Router();
const {
    createCustomerSupportCtrl,
    getCustomerSupportCtrl,
} = require("../controllers/customerSupportCtrl");

router.post("/create", createCustomerSupportCtrl);
router.get("/getAll", getCustomerSupportCtrl);

module.exports = router;
