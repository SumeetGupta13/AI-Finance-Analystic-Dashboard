const express = require('express');
const { body, param } = require('express-validator');
const { protect } = require('../middleware/authMiddleware');
const {
  getDefaultWatchlist,
  addDefaultWatchlistItem,
  removeDefaultWatchlistItem,
} = require('../controllers/watchlistController');
const validateRequest = require('../validators/validateRequest');

const router = express.Router();

const addSymbolValidator = [
  body('assetType').optional().isIn(['stock', 'crypto', 'mutual_fund']).withMessage('Asset type must be stock, crypto, or mutual_fund'),
  body('symbol').trim().isLength({ min: 1, max: 24 }).withMessage('Symbol is required'),
  validateRequest,
];

const symbolParamValidator = [
  param('symbol').trim().isLength({ min: 1, max: 24 }).withMessage('Symbol is required'),
  validateRequest,
];

router.use(protect);
router.get('/', getDefaultWatchlist);
router.post('/', addSymbolValidator, (req, res, next) => {
  req.body.assetType = req.body.assetType || 'stock';
  return addDefaultWatchlistItem(req, res, next);
});
router.delete('/:symbol', symbolParamValidator, removeDefaultWatchlistItem);

module.exports = router;
