const express = require('express');
const {
  getStocks,
  getStockBySymbol,
  getCryptoMarkets,
  getMutualFunds,
  getTrending,
  getTopGainers,
  getTopLosers,
  getHistoricalData,
  getMarketNews,
  getMarketTrends,
} = require('../controllers/marketController');

const router = express.Router();

router.get('/stocks', getStocks);
router.get('/stocks/:symbol', getStockBySymbol);
router.get('/crypto', getCryptoMarkets);
router.get('/mutual-funds', getMutualFunds);
router.get('/trending', getTrending);
router.get('/gainers', getTopGainers);
router.get('/losers', getTopLosers);
router.get('/history/:symbol', getHistoricalData);
router.get('/news', getMarketNews);
router.get('/trends', getMarketTrends);

module.exports = router;
