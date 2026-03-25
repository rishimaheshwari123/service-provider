const mongoose = require('mongoose');

// Define the changes schema separately for reuse
const changesSchema = new mongoose.Schema({
    title: String,
    price: String,
    location: String,
    type: String,
    category: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Category',
    },
    description: String,
    images: [{
        public_id: String,
        url: String,
        _id: mongoose.Schema.Types.ObjectId,
    }],
    status: String,
}, { _id: false }); // Disable _id for subdocuments

const serviceUpdateRequestSchema = new mongoose.Schema({
    property: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Property',
        required: true,
    },
    vendor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Vendor',
        required: true,
    },
    requestType: {
        type: String,
        enum: ['update', 'image_update'],
        required: true,
    },
    // Store the proposed changes
    proposedChanges: {
        type: changesSchema,
        required: true,
    },
    // Store current values for comparison
    currentValues: {
        type: changesSchema,
        required: true,
    },
    status: {
        type: String,
        enum: ['pending', 'approved', 'rejected'],
        default: 'pending',
    },
    adminResponse: {
        message: String,
        respondedBy: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'Auth',
        },
        respondedAt: Date,
    },
    reason: {
        type: String,
        trim: true,
    },
}, { timestamps: true });

module.exports = mongoose.model('ServiceUpdateRequest', serviceUpdateRequestSchema);