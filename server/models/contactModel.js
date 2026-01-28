const mongoose = require('mongoose');

const contactSchema = new mongoose.Schema({
    name: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: false,
        trim: true
    },
    phone: {
        type: String,
        required: true,
        trim: true
    },
    message: {
        type: String,
        trim: true
    },
    vendor: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Vendor',
        required: true
    },
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'auth',
        required: true
    },
    property: {
        type: Object,
        required: true
    }
}, { timestamps: true });

module.exports = mongoose.model('Contact', contactSchema);
