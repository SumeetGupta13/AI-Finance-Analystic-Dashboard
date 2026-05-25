const { body, param } = require('express-validator');
const validateRequest = require('./validateRequest');

const tradeValidator = [
  body('assetType').isIn(['stock', 'crypto', 'mutual_fund']).withMessage('Asset type must be stock, crypto, or mutual_fund'),
  body('symbol').trim().isLength({ min: 1, max: 24 }).withMessage('Symbol is required'),
  body('quantity').isFloat({ gt: 0 }).withMessage('Quantity must be greater than zero').toFloat(),
  validateRequest,
];

const transactionIdValidator = [
  param('transactionId').isMongoId().withMessage('A valid transaction id is required'),
  validateRequest,
];

module.exports = { tradeValidator, transactionIdValidator };
