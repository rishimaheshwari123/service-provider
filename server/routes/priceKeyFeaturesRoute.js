const express = require("express");
const router = express.Router();
const {
  getKeyFeatures,
  upsertKeyFeatures,
  deleteKeyFeatures,
} = require("../controllers/priceKeyFeaturesCtrl");
const { verifyToken } = require("../utils/verifyToken");

// Get key features (common for all categories)
router.get("/", getKeyFeatures);

// Create or update key features
router.put("/", verifyToken, upsertKeyFeatures);

// Delete key features
router.delete("/", verifyToken, deleteKeyFeatures);

module.exports = router;
