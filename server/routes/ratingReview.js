const express = require("express");
const {
    createRating,

    getAllRatingReview
} = require("../controllers/RatingandReview");
const router = express.Router();


router.post("/create", createRating);

router.get("/getAll", getAllRatingReview);





module.exports = router;


