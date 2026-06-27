const RatingAndReview = require("../models/RatingandReview");
const Property = require("../models/propertyModel");
const mongoose = require("mongoose");
const createSystemLog = require("../utils/auditLogger");

// Create a new rating and review
exports.createRating = async (req, res) => {
  try {
    const { rating, review, userId, property, guestName, guestEmail } = req.body;

    if (!rating  || !property) {
      return res.status(400).json({
        success: false,
        message: "Rating, review, and property are required",
      });
    }

    let finalUserId = userId;

    // Handle guest users
    if (!userId || userId === "guest-user-id") {
      if (!guestName || !guestEmail) {
        return res.status(400).json({
          success: false,
          message: "Guest name and email are required for guest reviews",
        });
      }
      
      // For now, we'll use a placeholder guest user ID
      // In production, you might want to create a proper guest user system
      finalUserId = "guest-user-placeholder";
    }

    // 1. Create rating & review
    const ratingReview = await RatingAndReview.create({
      rating: parseInt(rating),
      review,
      user: finalUserId,
      property,
      // Store guest info if it's a guest review
      ...(finalUserId === "guest-user-placeholder" && {
        guestName,
        guestEmail,
      }),
    });

    // 2. Add review ID to property document
    await Property.findByIdAndUpdate(
      property,
      { $push: { review: ratingReview._id } },
      { new: true }
    );

    await createSystemLog({
      actorId: finalUserId === "guest-user-placeholder" ? null : finalUserId,
      actorModel: finalUserId === "guest-user-placeholder" ? null : "auth",
      entityId: ratingReview._id,
      entityModel: "RatingAndReview",
      action: "CREATE",
      description: `Rating and review created for property ${property}`,
    });

    return res.status(201).json({
      success: true,
      message: "Rating and review created successfully",
      ratingReview,
    });
  } catch (error) {
    console.error("Error in createRating:", error);
    return res.status(500).json({
      success: false,
      message: "Internal server error",
      error: error.message,
    });
  }
};

// Get all rating and reviews
exports.getAllRatingReview = async (req, res) => {
  try {
    const allReviews = await RatingAndReview.find({}).populate("user").exec();
    res.status(200).json({
      success: true,
      allReviews,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({
      success: false,
      message: "Failed to retrieve the rating and review for the course",
      error: error.message,
    });
  }
};
