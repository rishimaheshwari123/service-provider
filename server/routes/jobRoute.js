const express = require('express');
const router = express.Router();
const { createJobCtrl, getAllJobsCtrl, getJobByIdCtrl } = require('../controllers/jobCtrl');

router.post('/create', createJobCtrl);
router.get('/getAll', getAllJobsCtrl);
router.get('/get/:id', getJobByIdCtrl);

module.exports = router;
