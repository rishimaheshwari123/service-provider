const RatingAndReview = require("../models/RatingandReview");
const Property = require("../models/propertyModel");
const mongoose = require("mongoose");

// Create a new rating and review
exports.createRating = async (req, res) => {
  try {
    const { rating, review, userId, property } = req.body;

    if (!rating || !review || !userId || !property) {
      return res.status(400).json({
        success: false,
        message: "Rating, review, userId, and property are required",
      });
    }

    // 1. Create rating & review
    const ratingReview = await RatingAndReview.create({
      rating,
      review,
      user: userId,
      property,
    });

    // 2. Add review ID to property document
    await Property.findByIdAndUpdate(
      property,
      { $push: { review: ratingReview._id } },
      { new: true } // return updated document if needed
    );

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
