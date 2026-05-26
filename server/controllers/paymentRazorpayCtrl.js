const VendorCategoryPurchase = require("../models/vendorCategoryPurchase");
const crypto = require("crypto");
const { razorpayInstance } = require("../config/razorpay");

// Helper function to create property/service automatically
const createPropertyForCategory = async (vendorId, categoryId) => {
  try {
    const Property = require("../models/propertyModel");
    const Vendor = require("../models/vendorModel");
    const Category = require("../models/categoryModel");

    // Get vendor and category details
    const vendor = await Vendor.findById(vendorId);
    const category = await Category.findById(categoryId);

    if (!vendor || !category) {
      console.log("Vendor or category not found for property creation");
      return null;
    }

    // Check if property already exists for this vendor-category combination
    const existingProperty = await Property.findOne({
      vendor: vendorId,
      category: category.name
    });

    if (existingProperty) {
      console.log("Property already exists for this vendor-category combination");
      return existingProperty;
    }

    // Create property with vendor and category information
    const propertyData = {
      title: category.name, // Category name as title
      price: category.price.toString(), // Category price
      location: vendor.address || vendor.serviceLocation || "Location not specified", // Vendor location
      type: "service", // Default type
      category: category.name, // Category name
      description: vendor.description || category.autoFilled || `${category.name} service provided by ${vendor.name}`, // Vendor description or category auto-filled
      images: category.image ? [{ url: category.image }] : [], // Category image
      vendor: vendorId, // Vendor ID
      status: "active"
    };

    const newProperty = await Property.create(propertyData);
    return newProperty;
  } catch (error) {
    console.error("Error creating property automatically:", error);
    return null;
  }
};

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
      status: "purchased", // Razorpay payments are immediately approved
    });

    await purchase.save();

    // Create property automatically for online Razorpay payment
    await createPropertyForCategory(vendorId, categoryId);

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
