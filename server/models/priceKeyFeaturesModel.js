const mongoose = require("mongoose");

const priceKeyFeaturesSchema = new mongoose.Schema(
  {
    price: {
      features: {
        type: [String],
        default: [],
      },
    },
    premiumPrice: {
      features: {
        type: [String],
        default: [],
      },
    },
    premiumPlusPrice: {
      features: {
        type: [String],
        default: [],
      },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("PriceKeyFeatures", priceKeyFeaturesSchema);
