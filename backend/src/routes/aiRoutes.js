const express = require('express');
const router = express.Router();
const {
  getInsights,
  getAlerts,
  getForecasts,
  getNews,
  getForecastBySymbol,
  fraudCheck,
} = require('../controllers/aiController');
const { protect } = require('../middlewares/authMiddleware');

router.use(protect);

router.get('/insights', getInsights);
router.get('/alerts', getAlerts);
router.get('/forecasts', getForecasts);
router.get('/news/:symbol', getNews);
router.get('/forecast/:symbol', getForecastBySymbol);
router.post('/fraud-check', fraudCheck);

module.exports = router;
