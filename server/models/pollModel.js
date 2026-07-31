const mongoose = require("mongoose");
const { POLL_CATEGORY_VALUES, POLL_AGE_GROUP_VALUES } = require("../constants/pollCategories");

const voteSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      refPath: "userModel",
      required: true,
    },
    userModel: {
      type: String,
      required: true,
      enum: ["auth", "Vendor"],
      default: "auth",
    },
    vote: {
      type: String,
      enum: ["up", "down"],
      required: true,
    },
    votedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const pollSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 180,
    },
    image: {
      type: String,
      required: true,
    },
    category: {
      type: String,
      enum: POLL_CATEGORY_VALUES,
      required: true,
      default: "other",
      trim: true,
    },
    ageGroup: {
      type: String,
      enum: POLL_AGE_GROUP_VALUES,
      required: true,
      default: "group_a",
      trim: true,
    },
    active: {
      type: Boolean,
      default: true,
    },
    upVotes: {
      type: Number,
      default: 0,
      min: 0,
    },
    downVotes: {
      type: Number,
      default: 0,
      min: 0,
    },
    votes: {
      type: [voteSchema],
      default: [],
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "auth",
    },
  },
  { timestamps: true }
);

pollSchema.index({ active: 1, createdAt: -1 });
pollSchema.index({ category: 1, ageGroup: 1, active: 1 });

pollSchema.virtual("totalVotes").get(function () {
  return (this.upVotes || 0) + (this.downVotes || 0);
});

pollSchema.pre("validate", function (next) {
  if (!POLL_CATEGORY_VALUES.includes(this.category)) {
    this.category = "other";
  }

  if (!POLL_AGE_GROUP_VALUES.includes(this.ageGroup)) {
    this.ageGroup = "group_a";
  }

  next();
});

module.exports = mongoose.model("Poll", pollSchema);