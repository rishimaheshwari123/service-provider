const express = require("express");
const router = express.Router();
const {
  getKeyFeatures,
  upsertKeyFeatures,
  deleteKeyFeatures,
} = require("../controllers/priceKeyFeaturesCtrl");

// Get key features (common for all categories)
router.get("/", getKeyFeatures);

// Create or update key features
router.put("/", upsertKeyFeatures);

// Delete key features
router.delete("/", deleteKeyFeatures);

module.exports = router;
