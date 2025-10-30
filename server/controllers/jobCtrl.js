const Job = require('../models/jobModel');

const createJobCtrl = async (req, res) => {
    try {
        const {
            title,
            location,
            type,
            department,
            experience,
            salary,
            description,
            responsibilities,
            requirements,
            benefits,
            deadline
        } = req.body;

        if (
            !title || !location || !type || !department || !experience || !salary ||
            !description || !responsibilities || !requirements || !benefits || !deadline
        ) {
            return res.status(400).json({ message: 'All fields are required.' });
        }

        const job = await Job.create({
            title,
            location,
            type,
            department,
            experience,
            salary,
            description,
            responsibilities,
            requirements,
            benefits,
            deadline
        });

        res.status(201).json({ success: true, message: 'Job created successfully', job });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

const getAllJobsCtrl = async (req, res) => {
    try {
        const jobs = await Job.find().sort({ createdAt: -1 }); // latest first
        res.status(200).json({ success: true, jobs });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};

const getJobByIdCtrl = async (req, res) => {
    try {
        const { id } = req.params;

        const job = await Job.findById(id);

        if (!job) {
            return res.status(404).json({ message: 'Job not found' });
        }

        console.log(job)
        res.status(200).json({ success: true, job });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Server error', error: error.message });
    }
};



module.exports = { createJobCtrl, getAllJobsCtrl, getJobByIdCtrl }