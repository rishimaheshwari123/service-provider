const express = require('express');
const router = express.Router();
const { createJobCtrl, getAllJobsCtrl, getJobByIdCtrl } = require('../controllers/jobCtrl');
const { verifyToken, isAdmin } = require('../utils/verifyToken');

router.post('/create', verifyToken, isAdmin, createJobCtrl);
router.get('/getAll', verifyToken, isAdmin, getAllJobsCtrl);
router.get('/get/:id', verifyToken, isAdmin, getJobByIdCtrl);

module.exports = router;
