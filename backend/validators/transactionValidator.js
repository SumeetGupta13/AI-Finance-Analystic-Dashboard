const { body, param, query } = require('express-validator');
const validateRequest = require('./validateRequest');

const transactionTypes = ['income', 'expense', 'investment', 'savings', 'stock_buy', 'stock_sell', 'buy', 'sell'];
const paymentMethods = ['cash', 'bank', 'upi', 'card', 'net_banking', 'virtual_wallet', 'other'];

const tradeValidator = [
  body('assetType').optional().isIn(['stock', 'crypto', 'mutual_fund']).withMessage('Asset type must be stock, crypto, or mutual_fund'),
  body('symbol').trim().isLength({ min: 1, max: 24 }).withMessage('Symbol is required'),
  body('quantity').isFloat({ gt: 0 }).withMessage('Quantity must be greater than zero').toFloat(),
  validateRequest,
];

const createTransactionValidator = [
  body('type').isIn(transactionTypes).withMessage('Transaction type is invalid'),
  body('category').trim().isLength({ min: 1, max: 80 }).withMessage('Category is required'),
  body('title').trim().isLength({ min: 1, max: 140 }).withMessage('Title is required'),
  body('amount').optional().isFloat({ min: 0 }).withMessage('Amount cannot be negative').toFloat(),
  body('stockSymbol').optional().trim().isLength({ max: 24 }).withMessage('Stock symbol cannot exceed 24 characters'),
  body('stockName').optional().trim().isLength({ max: 120 }).withMessage('Stock name cannot exceed 120 characters'),
  body('quantity').optional().isFloat({ min: 0 }).withMessage('Quantity cannot be negative').toFloat(),
  body('price').optional().isFloat({ min: 0 }).withMessage('Price cannot be negative').toFloat(),
  body('totalValue').optional().isFloat({ min: 0 }).withMessage('Total value cannot be negative').toFloat(),
  body('fees').optional().isFloat({ min: 0 }).withMessage('Fees cannot be negative').toFloat(),
  body('profitLoss').optional().isFloat().withMessage('Profit/loss must be numeric').toFloat(),
  body('paymentMethod').optional().isIn(paymentMethods).withMessage('Payment method is invalid'),
  body('notes').optional().trim().isLength({ max: 500 }).withMessage('Notes cannot exceed 500 characters'),
  body('transactionDate').optional().isISO8601().withMessage('Transaction date must be a valid date').toDate(),
  validateRequest,
];

const updateTransactionValidator = [
  param('transactionId').isMongoId().withMessage('A valid transaction id is required'),
  body('type').optional().isIn(transactionTypes).withMessage('Transaction type is invalid'),
  body('category').optional().trim().isLength({ min: 1, max: 80 }).withMessage('Category is required'),
  body('title').optional().trim().isLength({ min: 1, max: 140 }).withMessage('Title is required'),
  body('amount').optional().isFloat({ min: 0 }).withMessage('Amount cannot be negative').toFloat(),
  body('stockSymbol').optional().trim().isLength({ max: 24 }).withMessage('Stock symbol cannot exceed 24 characters'),
  body('stockName').optional().trim().isLength({ max: 120 }).withMessage('Stock name cannot exceed 120 characters'),
  body('quantity').optional().isFloat({ min: 0 }).withMessage('Quantity cannot be negative').toFloat(),
  body('price').optional().isFloat({ min: 0 }).withMessage('Price cannot be negative').toFloat(),
  body('totalValue').optional().isFloat({ min: 0 }).withMessage('Total value cannot be negative').toFloat(),
  body('fees').optional().isFloat({ min: 0 }).withMessage('Fees cannot be negative').toFloat(),
  body('profitLoss').optional().isFloat().withMessage('Profit/loss must be numeric').toFloat(),
  body('paymentMethod').optional().isIn(paymentMethods).withMessage('Payment method is invalid'),
  body('notes').optional().trim().isLength({ max: 500 }).withMessage('Notes cannot exceed 500 characters'),
  body('transactionDate').optional().isISO8601().withMessage('Transaction date must be a valid date').toDate(),
  validateRequest,
];

const listTransactionValidator = [
  query('type').optional().isIn([...transactionTypes, 'all']).withMessage('Transaction type filter is invalid'),
  query('status').optional().isIn(['completed', 'rejected', 'all']).withMessage('Status filter is invalid'),
  query('month').optional().isInt({ min: 1, max: 12 }).withMessage('Month must be between 1 and 12').toInt(),
  query('year').optional().isInt({ min: 1970 }).withMessage('Year must be valid').toInt(),
  query('limit').optional().isInt({ min: 1, max: 500 }).withMessage('Limit must be between 1 and 500').toInt(),
  validateRequest,
];

const transactionIdValidator = [
  param('transactionId').isMongoId().withMessage('A valid transaction id is required'),
  validateRequest,
];

module.exports = {
  tradeValidator,
  createTransactionValidator,
  updateTransactionValidator,
  listTransactionValidator,
  transactionIdValidator,
};
