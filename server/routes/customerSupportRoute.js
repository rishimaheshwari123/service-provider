const express = require("express");
const router = express.Router();
const {
    createCustomerSupportCtrl,
    getCustomerSupportCtrl,
    updateSupportStatusCtrl,
    addAdminRemarkCtrl,
} = require("../controllers/customerSupportCtrl");
const { verifyToken, isAdmin } = require("../utils/verifyToken");

router.post("/create", createCustomerSupportCtrl);
router.get("/getAll", verifyToken, isAdmin, getCustomerSupportCtrl);
router.put("/update-status/:id", verifyToken, isAdmin, updateSupportStatusCtrl);
router.post("/add-remark/:id", verifyToken, isAdmin, addAdminRemarkCtrl);

module.exports = router;
