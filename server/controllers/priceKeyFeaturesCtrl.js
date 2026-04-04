const PriceKeyFeatures = require("../models/priceKeyFeaturesModel");

// Get key features (common for all categories)
exports.getKeyFeatures = async (req, res) => {
  try {
    let keyFeatures = await PriceKeyFeatures.findOne();
    
    if (!keyFeatures) {
      // Return empty structure if not found
      return res.status(200).json({
        success: true,
        data: {
          price: { features: [] },
          premiumPrice: { features: [] },
          premiumPlusPrice: { features: [] },
        },
      });
    }
    
    res.status(200).json({
      success: true,
      data: keyFeatures,
    });
  } catch (error) {
    console.error("Error fetching key features:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch key features",
      error: error.message,
    });
  }
};

// Create or update key features (common for all categories)
exports.upsertKeyFeatures = async (req, res) => {
  try {
    const { price, premiumPrice, premiumPlusPrice } = req.body;
    
    // Find existing or create new (only one document should exist)
    let keyFeatures = await PriceKeyFeatures.findOne();
    
    if (keyFeatures) {
      // Update existing
      keyFeatures.price = { features: price?.features || [] };
      keyFeatures.premiumPrice = { features: premiumPrice?.features || [] };
      keyFeatures.premiumPlusPrice = { features: premiumPlusPrice?.features || [] };
      await keyFeatures.save();
    } else {
      // Create new
      keyFeatures = await PriceKeyFeatures.create({
        price: { features: price?.features || [] },
        premiumPrice: { features: premiumPrice?.features || [] },
        premiumPlusPrice: { features: premiumPlusPrice?.features || [] },
      });
    }
    
    res.status(200).json({
      success: true,
      message: "Key features updated successfully",
      data: keyFeatures,
    });
  } catch (error) {
    console.error("Error updating key features:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update key features",
      error: error.message,
    });
  }
};

// Delete all key features
exports.deleteKeyFeatures = async (req, res) => {
  try {
    await PriceKeyFeatures.deleteMany({});
    
    res.status(200).json({
      success: true,
      message: "Key features deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting key features:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete key features",
      error: error.message,
    });
  }
};
