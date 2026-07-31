const jwt = require("jsonwebtoken");
const mongoose = require("mongoose");
const Poll = require("../models/pollModel");
const { normalizePollCategory, normalizePollAgeGroup } = require("../constants/pollCategories");
const { uploadImageToCloudinary } = require("../config/s3Uploader");

const getTokenUserId = (req) => {
  const token = req.headers.authorization?.split(" ")[1] || req.cookies?.token || req.body?.token;

  if (!token) return null;

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    return decoded?.id ? decoded.id.toString() : null;
  } catch (error) {
    return null;
  }
};

const getVoteUserId = (vote) => {
  if (!vote?.user) return "";
  return (vote.user._id || vote.user).toString();
};

const recalculateCounts = (poll) => {
  poll.upVotes = poll.votes.filter((item) => item.vote === "up").length;
  poll.downVotes = poll.votes.filter((item) => item.vote === "down").length;
};

const serializeVoteHistory = (votes = []) => {
  return votes
    .map((item) => ({
      userId: getVoteUserId(item),
      userName: item.user?.name || "Unknown User",
      userEmail: item.user?.email || "",
      userPhone: item.user?.phone || "",
      vote: item.vote,
      votedAt: item.votedAt,
    }))
    .sort((a, b) => new Date(b.votedAt || 0) - new Date(a.votedAt || 0));
};

const serializePoll = (poll, userId = null, options = {}) => {
  const data = poll.toObject({ virtuals: true });
  const currentVote = userId
    ? poll.votes.find((item) => getVoteUserId(item) === userId)?.vote || null
    : null;

  delete data.votes;

  const serializedPoll = {
    ...data,
    totalVotes: (data.upVotes || 0) + (data.downVotes || 0),
    currentUserVote: currentVote,
  };

  if (options.includeVoteHistory) {
    serializedPoll.voteHistory = serializeVoteHistory(poll.votes);
  }

  return serializedPoll;
};

const createPollCtrl = async (req, res) => {
  try {
    const { title, category, ageGroup, active } = req.body;
    const imageFile = Array.isArray(req.files?.image) ? req.files.image[0] : req.files?.image;
    const normalizedCategory = normalizePollCategory(category);
    const normalizedAgeGroup = normalizePollAgeGroup(ageGroup);

    if (!title?.trim() || !normalizedCategory || !normalizedAgeGroup || !imageFile) {
      return res.status(400).json({
        success: false,
        message: "Title, valid poll category, valid age group, and image are required",
      });
    }

    const uploadedImage = await uploadImageToCloudinary(imageFile, "polls", 700, 85);

    const poll = await Poll.create({
      title: title.trim(),
      category: normalizedCategory,
      ageGroup: normalizedAgeGroup,
      image: uploadedImage.secure_url,
      active: active === undefined ? true : active === "true" || active === true,
      createdBy: req.user?.id,
    });

    return res.status(201).json({
      success: true,
      message: "Poll created successfully",
      poll: serializePoll(poll, null, { includeVoteHistory: true }),
    });
  } catch (error) {
    console.error("CREATE_POLL_ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while creating poll",
    });
  }
};

const getActivePollsCtrl = async (req, res) => {
  try {
    const userId = getTokenUserId(req);
    const { category, ageGroup } = req.query;
    const query = { active: true };
    const normalizedCategory = normalizePollCategory(category);
    const normalizedAgeGroup = normalizePollAgeGroup(ageGroup);

    if (normalizedCategory) query.category = normalizedCategory;
    if (normalizedAgeGroup) query.ageGroup = normalizedAgeGroup;

    const polls = await Poll.find(query).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      polls: polls.map((poll) => serializePoll(poll, userId)),
    });
  } catch (error) {
    console.error("GET_ACTIVE_POLLS_ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching polls",
    });
  }
};

const getAdminPollsCtrl = async (req, res) => {
  try {
    const { status, category, ageGroup, search } = req.query;
    const query = {};
    const normalizedCategory = normalizePollCategory(category);
    const normalizedAgeGroup = normalizePollAgeGroup(ageGroup);

    if (status === "active") query.active = true;
    if (status === "inactive") query.active = false;
    if (normalizedCategory) query.category = normalizedCategory;
    if (normalizedAgeGroup) query.ageGroup = normalizedAgeGroup;
    if (search?.trim()) {
      query.title = { $regex: search.trim(), $options: "i" };
    }

    const polls = await Poll.find(query)
      .populate("createdBy", "name email")
      .populate("votes.user", "name email phone")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      polls: polls.map((poll) => serializePoll(poll, null, { includeVoteHistory: true })),
    });
  } catch (error) {
    console.error("GET_ADMIN_POLLS_ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while fetching admin polls",
    });
  }
};

const votePollCtrl = async (req, res) => {
  try {
    const { id } = req.params;
    const { vote } = req.body;
    const userId = req.user?.id?.toString();

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid poll",
      });
    }

    if (!["up", "down"].includes(vote)) {
      return res.status(400).json({
        success: false,
        message: "Vote must be up or down",
      });
    }

    const poll = await Poll.findOne({ _id: id, active: true });
    if (!poll) {
      return res.status(404).json({
        success: false,
        message: "Poll not found or inactive",
      });
    }

    const existingVote = poll.votes.find((item) => getVoteUserId(item) === userId);

    if (existingVote) {
      existingVote.vote = vote;
      existingVote.votedAt = new Date();
    } else {
      poll.votes.push({
        user: userId,
        vote,
        userModel: req.user?.role === "vendor" ? "Vendor" : "auth"
      });
    }

    recalculateCounts(poll);
    await poll.save();

    return res.status(200).json({
      success: true,
      message: "Vote counted successfully",
      poll: serializePoll(poll, userId),
    });
  } catch (error) {
    console.error("VOTE_POLL_ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while voting",
    });
  }
};

const updatePollStatusCtrl = async (req, res) => {
  try {
    const { id } = req.params;
    const { active } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid poll",
      });
    }

    const poll = await Poll.findByIdAndUpdate(
      id,
      { active: active === true || active === "true" },
      { new: true }
    )
      .populate("createdBy", "name email")
      .populate("votes.user", "name email phone");

    if (!poll) {
      return res.status(404).json({
        success: false,
        message: "Poll not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: poll.active ? "Poll activated" : "Poll deactivated",
      poll: serializePoll(poll, null, { includeVoteHistory: true }),
    });
  } catch (error) {
    console.error("UPDATE_POLL_STATUS_ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while updating poll status",
    });
  }
};

const deletePollCtrl = async (req, res) => {
  try {
    const { id } = req.params;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({
        success: false,
        message: "Invalid poll",
      });
    }

    const poll = await Poll.findByIdAndDelete(id);
    if (!poll) {
      return res.status(404).json({
        success: false,
        message: "Poll not found",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Poll deleted successfully",
    });
  } catch (error) {
    console.error("DELETE_POLL_ERROR:", error);
    return res.status(500).json({
      success: false,
      message: "Server error while deleting poll",
    });
  }
};

module.exports = {
  createPollCtrl,
  getActivePollsCtrl,
  getAdminPollsCtrl,
  votePollCtrl,
  updatePollStatusCtrl,
  deletePollCtrl,
};