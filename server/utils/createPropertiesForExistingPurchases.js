const VendorCategoryPurchase = require("../models/vendorCategoryPurchase");
const Property = require("../models/propertyModel");
const Vendor = require("../models/vendorModel");
const Category = require("../models/categoryModel");

// Utility function to create properties for all existing purchased categories
const createPropertiesForExistingPurchases = async () => {
  try {
    console.log("Starting to create properties for existing purchases...");
    
    // Get all purchased categories
    const purchases = await VendorCategoryPurchase.find({ status: "purchased" })
      .populate("vendor")
      .populate("category");
    
    console.log(`Found ${purchases.length} purchased categories`);
    
    let created = 0;
    let skipped = 0;
    
    for (const purchase of purchases) {
      try {
        if (!purchase.vendor || !purchase.category) {
          console.log(`Skipping purchase ${purchase._id} - missing vendor or category`);
          skipped++;
          continue;
        }
        
        // Check if property already exists
        const existingProperty = await Property.findOne({
          vendor: purchase.vendor._id,
          category: purchase.category.name
        });
        
        if (existingProperty) {
          console.log(`Property already exists for vendor ${purchase.vendor.name} - category ${purchase.category.name}`);
          skipped++;
          continue;
        }
        
        // Create property
        const propertyData = {
          title: purchase.category.name,
          price: purchase.category.price.toString(),
          location: purchase.vendor.address || purchase.vendor.serviceLocation || "Location not specified",
          type: "service",
          category: purchase.category.name,
          description: purchase.vendor.description || purchase.category.autoFilled || `${purchase.category.name} service provided by ${purchase.vendor.name}`,
          images: purchase.category.image ? [{ url: purchase.category.image }] : [],
          vendor: purchase.vendor._id,
          status: "active"
        };
        
        await Property.create(propertyData);
        console.log(`Created property for vendor ${purchase.vendor.name} - category ${purchase.category.name}`);
        created++;
        
      } catch (error) {
        console.error(`Error creating property for purchase ${purchase._id}:`, error);
        skipped++;
      }
    }
    
    console.log(`Completed: ${created} properties created, ${skipped} skipped`);
    return { created, skipped, total: purchases.length };
    
  } catch (error) {
    console.error("Error in createPropertiesForExistingPurchases:", error);
    throw error;
  }
};

// Function to create property for a specific vendor-category combination
const createPropertyForVendorCategory = async (vendorId, categoryId) => {
  try {
    const vendor = await Vendor.findById(vendorId);
    const category = await Category.findById(categoryId);
    
    if (!vendor || !category) {
      throw new Error("Vendor or category not found");
    }
    
    // Check if property already exists
    const existingProperty = await Property.findOne({
      vendor: vendorId,
      category: category.name
    });
    
    if (existingProperty) {
      return { success: false, message: "Property already exists", property: existingProperty };
    }
    
    // Create property
    const propertyData = {
      title: category.name,
      price: category.price.toString(),
      location: vendor.address || vendor.serviceLocation || "Location not specified",
      type: "service",
      category: category.name,
      description: vendor.description || category.autoFilled || `${category.name} service provided by ${vendor.name}`,
      images: category.image ? [{ url: category.image }] : [],
      vendor: vendorId,
      status: "active"
    };
    
    const newProperty = await Property.create(propertyData);
    return { success: true, message: "Property created successfully", property: newProperty };
    
  } catch (error) {
    console.error("Error creating property:", error);
    throw error;
  }
};

module.exports = {
  createPropertiesForExistingPurchases,
  createPropertyForVendorCategory
};