const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const {
  getPortfolio,
  getPortfolioAnalytics,
  addHolding,
  updateHolding,
  removeHolding,
} = require('../controllers/portfolioController');
const {
  addHoldingValidator,
  updateHoldingValidator,
  removeHoldingValidator,
} = require('../validators/portfolioValidator');

const router = express.Router();

router.use(protect);
router.get('/', getPortfolio);
router.get('/analytics', getPortfolioAnalytics);
router.post('/holdings', addHoldingValidator, addHolding);
router.patch('/holdings/:holdingId', updateHoldingValidator, updateHolding);
router.delete('/holdings/:holdingId', removeHoldingValidator, removeHolding);

module.exports = router;
