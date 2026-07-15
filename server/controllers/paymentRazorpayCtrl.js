const VendorCategoryPurchase = require("../models/vendorCategoryPurchase");
const crypto = require("crypto");
const { razorpayInstance } = require("../config/razorpay");
const {
  createPropertyForCategory,
  sendVendorWelcomeMessages,
  sendVendorApprovalMessages,
} = require("./categoryCtrl");

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
      paymentMode = "razorpay", // Changed default to razorpay for clarity
      priceTier = "basic",
      selectedPrice,
      finalPrice,
      couponCode,
      couponId,
      discountAmount = 0,
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

    // Check if category exists
    const Category = require("../models/categoryModel");
    const category = await Category.findById(categoryId);
    if (!category) {
      return res.status(404).json({ message: "Category not found." });
    }

    // Calculate price based on tier if not provided
    let calculatedPrice = selectedPrice || finalPrice;
    if (!calculatedPrice) {
      switch (priceTier) {
        case "premium":
          calculatedPrice = category.premiumPrice || category.price;
          break;
        case "premiumPlus":
          calculatedPrice = category.premiumPlusPrice || category.price;
          break;
        default:
          calculatedPrice = category.price;
      }
    }

    // Check if purchase record already exists for this vendor-category combination
    let purchase = await VendorCategoryPurchase.findOne({ vendor: vendorId, category: categoryId });

    if (purchase) {
      // Update existing purchase
      purchase.status = "purchased";
      purchase.transactionId = razorpay_payment_id;
      purchase.paymentMode = paymentMode;
      purchase.priceTier = priceTier;
      purchase.selectedPrice = selectedPrice || calculatedPrice;
      purchase.finalPrice = finalPrice || (calculatedPrice - (discountAmount || 0));
      purchase.couponCode = couponCode;
      purchase.couponId = couponId;
      purchase.discountAmount = discountAmount;
      purchase.reason = undefined; // Clear any previous rejection reason
      await purchase.save();
    } else {
      // Create VendorCategoryPurchase record
      purchase = new VendorCategoryPurchase({
        vendor: vendorId,
        category: categoryId,
        transactionId: razorpay_payment_id,
        paymentMode,
        status: "purchased", // Razorpay payments are immediately approved
        priceTier,
        selectedPrice: selectedPrice || calculatedPrice,
        finalPrice: finalPrice || (calculatedPrice - (discountAmount || 0)),
        couponCode,
        couponId,
        discountAmount,
      });
      await purchase.save();
    }

    // Create property automatically for online Razorpay payment
    await createPropertyForCategory(vendorId, categoryId);

    // Send notifications if vendor exists
    try {
      const Vendor = require("../models/vendorModel");
      const vendor = await Vendor.findById(vendorId);
      if (vendor) {
        // Send welcome messages on first purchase
        const previousPurchases = await VendorCategoryPurchase.countDocuments({
          vendor: vendorId,
          _id: { $ne: purchase._id } // Exclude current purchase
        });

        if (previousPurchases === 0) {
          console.log("🎊 This is vendor's first purchase! Sending welcome messages...");
          await sendVendorWelcomeMessages(vendor);
        }

        // Send approval message
        await sendVendorApprovalMessages(vendor);
      }
    } catch (msgError) {
      console.error("Error sending vendor purchase/approval notifications:", msgError);
    }

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

module.exports = { createRazorpayOrderCtrl, verifyPaymentCtrl };
