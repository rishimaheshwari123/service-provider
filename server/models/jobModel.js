const mongoose = require('mongoose');

const jobSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true
    },
    location: {
        type: String,
        required: true
    },
    type: {
        type: String,
        required: true
    },
    department: {
        type: String,
        required: true
    },
    experience: {
        type: String,
        required: true
    },
    salary: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    responsibilities: {
        type: Array, // OR better: type: [String]
        required: true
    },
    requirements: {
        type: Array, // OR better: type: [String]
        required: true
    },
    benefits: {
        type: Array, // OR better: type: [String]
        required: true
    },
    deadline: {
        type: String, // OR type: Date if you want actual date comparison
        required: true
    }
}, {
    timestamps: true
});

module.exports = mongoose.model('Job', jobSchema);
