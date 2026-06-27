const express = require("express");
const {
  createContactCtrl,
  getContactsByVendorCtrl,
  getUserInquiryByIdCtrl,
  createGeneralContactCtrl,
} = require("../controllers/contactCtrl");
const router = express.Router();

router.post("/create", createContactCtrl);
router.post("/general", createGeneralContactCtrl);
router.get("/getAll/:id", getContactsByVendorCtrl);
router.get("/user-inquiry/:id", getUserInquiryByIdCtrl);

module.exports = router;
