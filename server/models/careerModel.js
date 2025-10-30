const mongoose = require('mongoose');

const ApplicationSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: true,
        trim: true,
    },
    lastName: {
        type: String,
        required: true,
        trim: true,
    },
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
    },
    phone: {
        type: String,
        required: true,
    },
    address: {
        type: String,
        required: true,
    },
    experience: {
        type: String,
        required: true,
    },
    education: {
        type: String,
        required: true,
    },
    portfolioLink: {
        type: String,
        required: true,
    },
    source: {
        type: String,
        required: true,
    },
    job: {
        type: Object,
        required: true,
        default: {},
    },
}, { timestamps: true });

module.exports = mongoose.model('Application', ApplicationSchema);
