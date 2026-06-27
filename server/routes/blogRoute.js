const express = require("express");
const { createBlogsCtrl, getAllBlogsCtrl, deleteBlogCtrl, getSingleBlogsCtrl, getBlogBySlugCtrl, updateBlogCtrl } = require("../controllers/blogCtrl");
const { verifyToken } = require("../utils/verifyToken");
const router = express.Router();

router.post("/create", verifyToken, createBlogsCtrl)
router.get("/getAll", getAllBlogsCtrl)
router.get("/get/:id", getSingleBlogsCtrl)
router.get("/slug/:slug", getBlogBySlugCtrl)
router.delete("/delete/:id", verifyToken, deleteBlogCtrl)
router.put("/:blogId", verifyToken, updateBlogCtrl)

module.exports = router