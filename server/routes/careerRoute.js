const express = require('express');
const router = express.Router();
const {
    createApplication,
    getAllApplications
} = require('../controllers/careerCtrl');

router.post('/create', createApplication);
router.get('/getAll', getAllApplications);

module.exports = router;
