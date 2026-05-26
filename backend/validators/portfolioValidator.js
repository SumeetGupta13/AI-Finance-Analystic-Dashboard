const { body, param } = require('express-validator');
const validateRequest = require('./validateRequest');

const assetTypeValidator = body('assetType')
  .isIn(['stock', 'crypto', 'mutual_fund'])
  .withMessage('Asset type must be stock, crypto, or mutual_fund');

const symbolValidator = body('symbol')
  .trim()
  .isLength({ min: 1, max: 24 })
  .withMessage('Symbol is required');

const quantityValidator = body('quantity')
  .isFloat({ gt: 0 })
  .withMessage('Quantity must be greater than zero')
  .toFloat();

const holdingIdValidator = param('holdingId').isMongoId().withMessage('A valid holding id is required');

const addHoldingValidator = [assetTypeValidator, symbolValidator, quantityValidator, validateRequest];

const tradeValidator = [
  body('assetType').optional().isIn(['stock', 'crypto', 'mutual_fund']).withMessage('Asset type must be stock, crypto, or mutual_fund'),
  symbolValidator,
  quantityValidator,
  validateRequest,
];

const updateHoldingValidator = [
  holdingIdValidator,
  body('quantity').optional().isFloat({ min: 0 }).withMessage('Quantity cannot be negative').toFloat(),
  body('averagePrice').optional().isFloat({ min: 0 }).withMessage('Average price cannot be negative').toFloat(),
  validateRequest,
];

const removeHoldingValidator = [holdingIdValidator, validateRequest];

module.exports = { addHoldingValidator, updateHoldingValidator, removeHoldingValidator, tradeValidator };
