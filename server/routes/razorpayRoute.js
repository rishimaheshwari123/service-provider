const express = require("express")
const { createRazorpayOrderCtrl, verifyPaymentCtrl } = require("../controllers/paymentRazorpayCtrl")
const router = express.Router()







router.post("/capturePayment", createRazorpayOrderCtrl)
router.post("/verifyPayment", verifyPaymentCtrl)



module.exports = router