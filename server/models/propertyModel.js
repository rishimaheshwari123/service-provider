const mongoose = require('mongoose');

const propertySchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true,
    },
    price: {
        type: String,
        required: true,
    },
    location: {
        type: String,
        required: true,
        trim: true,
    },
    type: {
        type: String,
        required: true,
    },
    category: {
        type: String,
        required: true,
    },

    description: {
        type: String,
        trim: true,
    },




    images: [
        {
            public_id: String,
            url: String,
        },
    ],
    vendor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Vendor',
        required: true,
    },
    review: [{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'RatingAndReview',
        required: true,
    }]
}, { timestamps: true });

module.exports = mongoose.model('Property', propertySchema);
