const express = require('express');
const router = express.Router();
const {
  getUserPortfolio,
  addStock,
  updateStock,
  removeStock,
  getPortfolioAnalytics
} = require('../controllers/portfolioController');
const { protect } = require('../middlewares/authMiddleware');

// All routes are protected via JWT middleware
router.use(protect);

router.route('/')
  .get(getUserPortfolio)
  .post(addStock);

router.get('/analytics', getPortfolioAnalytics);

router.route('/:id')
  .put(updateStock)
  .delete(removeStock);

module.exports = router;
