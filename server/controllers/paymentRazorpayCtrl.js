const VendorCategoryPurchase = require("../models/vendorCategoryPurchase");
const crypto = require("crypto");
const { razorpayInstance } = require("../config/razorpay");

const createRazorpayOrderCtrl = async (req, res) => {
    try {
        const { amount } = req.body;

        const options = {
            amount: amount * 100,
            currency: "INR",
            receipt: `order_rcptid_${Math.floor(Math.random() * 100000)}`,
        };

        const order = await razorpayInstance.orders.create(options);

        res.status(200).json({ order });
    } catch (error) {
        console.error("Error creating Razorpay order:", error);
        return res.status(500).json({
            success: false,
            message: "Error in creating order"
        });
    }
};


const verifyPaymentCtrl = async (req, res) => {
    try {
        const {
            razorpay_payment_id,
            razorpay_order_id,
            razorpay_signature,
            vendorId,
            categoryId,
            paymentMode = "prepaid", // default
        } = req.body;

        // Validate request body
        if (!razorpay_payment_id || !razorpay_order_id || !razorpay_signature || !vendorId || !categoryId) {
            return res.status(400).json({ message: "Missing payment, vendor, or category details." });
        }

        if (!process.env.RAZORPAY_SECRET) {
            console.error("RAZORPAY_SECRET is not set.");
            return res.status(500).json({ message: "Payment configuration error." });
        }

        // Verify Razorpay payment signature
        const secret = process.env.RAZORPAY_SECRET;
        const hmac = crypto.createHmac("sha256", secret);
        hmac.update(`${razorpay_order_id}|${razorpay_payment_id}`);
        const generated_signature = hmac.digest("hex");

        if (generated_signature !== razorpay_signature) {
            return res.status(400).json({ message: "Payment verification failed." });
        }

        // Create VendorCategoryPurchase record
        const purchase = new VendorCategoryPurchase({
            vendor: vendorId,
            category: categoryId,
            transactionId: razorpay_payment_id,
            paymentMode,
            status: "purchased", // default
        });

        await purchase.save();

        return res.status(200).json({
            success: true,
            message: "Payment verified and category purchased successfully.",
            purchase,
        });

    } catch (error) {
        console.error("Error in verifyPaymentCtrl:", error);
        return res.status(500).json({ message: "Internal server error." });
    }
};




module.exports = { createRazorpayOrderCtrl, verifyPaymentCtrl }
