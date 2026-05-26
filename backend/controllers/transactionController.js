const portfolioService = require('../services/portfolioService');
const transactionService = require('../services/transactionService');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/apiResponse');

const createTransaction = asyncHandler(async (req, res) => {
  const transaction = await transactionService.createTransaction(req.user._id, req.body);
  return sendSuccess(res, 201, 'Transaction created successfully', transaction);
});

const getTransactions = asyncHandler(async (req, res) => {
  const transactions = await transactionService.listTransactions(req.user._id, req.query);
  return sendSuccess(res, 200, 'Transactions loaded successfully', transactions, { count: transactions.length });
});

const getMonthlyTransactions = asyncHandler(async (req, res) => {
  const monthly = await transactionService.getMonthly(req.user._id, req.query);
  return sendSuccess(res, 200, 'Monthly transactions loaded successfully', monthly, { count: monthly.length });
});

const getTransactionSummary = asyncHandler(async (req, res) => {
  const summary = await transactionService.getSummary(req.user._id, req.query);
  return sendSuccess(res, 200, 'Transaction summary loaded successfully', summary);
});

const getTransactionAnalytics = asyncHandler(async (req, res) => {
  const portfolioAnalytics = await portfolioService.buildAnalytics(req.user._id);
  const analytics = await transactionService.getAnalytics(req.user._id, req.query, portfolioAnalytics);
  return sendSuccess(res, 200, 'Transaction analytics loaded successfully', analytics);
});

const getTransactionById = asyncHandler(async (req, res) => {
  const transaction = await transactionService.getTransactionById(req.user._id, req.params.transactionId);

  if (!transaction) {
    res.status(404);
    throw new Error('Transaction not found');
  }

  return sendSuccess(res, 200, 'Transaction loaded successfully', transaction);
});

const updateTransaction = asyncHandler(async (req, res) => {
  const transaction = await transactionService.updateTransaction(req.user._id, req.params.transactionId, req.body);

  if (!transaction) {
    res.status(404);
    throw new Error('Transaction not found');
  }

  return sendSuccess(res, 200, 'Transaction updated successfully', transaction);
});

const deleteTransaction = asyncHandler(async (req, res) => {
  const transaction = await transactionService.deleteTransaction(req.user._id, req.params.transactionId);

  if (!transaction) {
    res.status(404);
    throw new Error('Transaction not found');
  }

  return sendSuccess(res, 200, 'Transaction deleted successfully', transaction);
});

const buy = asyncHandler(async (req, res) => {
  const data = await portfolioService.buyAsset(req.user._id, req.body);
  const message = data.status === 'rejected' ? 'Buy order rejected' : 'Buy order completed';
  return sendSuccess(res, data.status === 'rejected' ? 200 : 201, message, data);
});

const sell = asyncHandler(async (req, res) => {
  const data = await portfolioService.sellAsset(req.user._id, req.body);
  const message = data.status === 'rejected' ? 'Sell order rejected' : 'Sell order completed';
  return sendSuccess(res, data.status === 'rejected' ? 200 : 201, message, data);
});

module.exports = {
  createTransaction,
  getTransactions,
  getMonthlyTransactions,
  getTransactionSummary,
  getTransactionAnalytics,
  getTransactionById,
  updateTransaction,
  deleteTransaction,
  buy,
  sell,
};
