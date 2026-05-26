const express = require('express');
const {
  getInsights,
  getRisk,
  getSuggestions,
  getNewsSentiment,
  getMarketTrends,
  getSummary,
  getTransactionInsights,
} = require('../controllers/aiController');
const { protect } = require('../middleware/authMiddleware');

const router = express.Router();

router.get('/insights', getInsights);
router.get('/summary', getSummary);
router.get('/risk', getRisk);
router.get('/suggestions', getSuggestions);
router.get('/news-sentiment', getNewsSentiment);
router.get('/market-trends', getMarketTrends);
router.get('/transactions', protect, getTransactionInsights);

module.exports = router;
