const express = require("express");
const { createBlogsCtrl, getAllBlogsCtrl, deleteBlogCtrl, getSingleBlogsCtrl, getBlogBySlugCtrl, updateBlogCtrl } = require("../controllers/blogCtrl");
const router = express.Router();

router.post("/create", createBlogsCtrl)
router.get("/getAll", getAllBlogsCtrl)
router.get("/get/:id", getSingleBlogsCtrl)
router.get("/slug/:slug", getBlogBySlugCtrl) // New slug-based route
router.delete("/delete/:id", deleteBlogCtrl)
router.put("/:blogId", updateBlogCtrl)

module.exports = router