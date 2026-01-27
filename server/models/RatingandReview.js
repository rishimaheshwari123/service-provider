const mongoose = require("mongoose");

const ratingAndReviewSchema = new mongoose.Schema({
	user: {
		type: mongoose.Schema.Types.ObjectId,
		required: true,
		ref: "auth",
	},
	property: {
		type: mongoose.Schema.Types.ObjectId,
		required: true,
		ref: "Property",
	},
	rating: {
		type: Number,
		required: true,
	},
	review: {
		type: String,
		required: true,
	},
	// Guest user fields
	guestName: {
		type: String,
		required: false,
	},
	guestEmail: {
		type: String,
		required: false,
	},
},
	{ timestamps: true }
);


module.exports = mongoose.model("RatingAndReview", ratingAndReviewSchema);
