const express = require("express");
const router = express.Router();

const { imageUpload, uploadImages } = require("../controllers/imageCtrl");
const { verifyToken } = require("../utils/verifyToken");

router.post("/upload", imageUpload);
router.post("/multi", uploadImages);

module.exports = router;
