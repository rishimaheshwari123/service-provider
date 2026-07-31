const express = require("express");
const {
  createPollCtrl,
  getActivePollsCtrl,
  getAdminPollsCtrl,
  votePollCtrl,
  updatePollStatusCtrl,
  deletePollCtrl,
} = require("../controllers/pollCtrl");
const { verifyToken, isAdmin, isUser, canVote } = require("../utils/verifyToken");

const router = express.Router();

router.get("/getAll", getActivePollsCtrl);

router.get("/admin/getAll", verifyToken, isAdmin, getAdminPollsCtrl);
router.post("/admin/create", verifyToken, isAdmin, createPollCtrl);
router.patch("/admin/status/:id", verifyToken, isAdmin, updatePollStatusCtrl);
router.delete("/admin/delete/:id", verifyToken, isAdmin, deletePollCtrl);

router.post("/vote/:id", verifyToken, canVote, votePollCtrl);

module.exports = router;
