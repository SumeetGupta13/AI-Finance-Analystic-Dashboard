const express = require('express');
const { getSummary } = require('../controllers/dashboardController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.use(protect);
router.get('/summary', getSummary);

module.exports = router;
