const { body, param } = require('express-validator');
const validateRequest = require('./validateRequest');

const createWatchlistValidator = [
  body('name').trim().isLength({ min: 2, max: 60 }).withMessage('Watchlist name must be between 2 and 60 characters'),
  validateRequest,
];

const addWatchlistItemValidator = [
  param('watchlistId').isMongoId().withMessage('A valid watchlist id is required'),
  body('assetType').isIn(['stock', 'crypto', 'mutual_fund']).withMessage('Asset type must be stock, crypto, or mutual_fund'),
  body('symbol').trim().isLength({ min: 1, max: 24 }).withMessage('Symbol is required'),
  validateRequest,
];

const watchlistIdValidator = [
  param('watchlistId').isMongoId().withMessage('A valid watchlist id is required'),
  validateRequest,
];

const removeWatchlistItemValidator = [
  param('watchlistId').isMongoId().withMessage('A valid watchlist id is required'),
  param('symbol').trim().isLength({ min: 1, max: 24 }).withMessage('Symbol is required'),
  validateRequest,
];

module.exports = {
  createWatchlistValidator,
  addWatchlistItemValidator,
  watchlistIdValidator,
  removeWatchlistItemValidator,
};
