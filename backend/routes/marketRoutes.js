const express = require('express');
const {
  getStocks,
  getStockBySymbol,
  getStockQuote,
  getBatchQuotes,
  getCompanyProfile,
  getCryptoMarkets,
  getTrendingCrypto,
  getMutualFunds,
  getTrending,
  getTopGainers,
  getTopLosers,
  getHistoricalData,
  getFinancialMetrics,
  getMarketNews,
  getMarketTrends,
  getSentimentAnalysis,
  getAIInsights,
} = require('../controllers/marketController');

const router = express.Router();

router.get('/stocks', getStocks);
router.post('/quotes', getBatchQuotes);
router.get('/stocks/:symbol', getStockBySymbol);
router.get('/quote/:symbol', getStockQuote);
router.get('/profile/:symbol', getCompanyProfile);
router.get('/crypto/trending', getTrendingCrypto);
router.get('/crypto', getCryptoMarkets);
router.get('/mutual-funds', getMutualFunds);
router.get('/trending', getTrending);
router.get('/gainers', getTopGainers);
router.get('/losers', getTopLosers);
router.get('/history/:symbol', getHistoricalData);
router.get('/metrics/:symbol', getFinancialMetrics);
router.get('/news', getMarketNews);
router.get('/trends', getMarketTrends);
router.get('/sentiment', getSentimentAnalysis);
router.get('/ai-insights', getAIInsights);

module.exports = router;
