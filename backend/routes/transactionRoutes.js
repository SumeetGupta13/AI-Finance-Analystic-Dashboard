const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const {
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
} = require('../controllers/transactionController');
const {
  createTransactionValidator,
  updateTransactionValidator,
  listTransactionValidator,
  transactionIdValidator,
  tradeValidator,
} = require('../validators/transactionValidator');

const router = express.Router();

router.use(protect);

router.post('/buy', tradeValidator, buy);
router.post('/sell', tradeValidator, sell);
router.post('/', createTransactionValidator, createTransaction);
router.get('/', listTransactionValidator, getTransactions);
router.get('/monthly', listTransactionValidator, getMonthlyTransactions);
router.get('/summary', listTransactionValidator, getTransactionSummary);
router.get('/analytics', listTransactionValidator, getTransactionAnalytics);
router.get('/:transactionId', transactionIdValidator, getTransactionById);
router.put('/:transactionId', updateTransactionValidator, updateTransaction);
router.delete('/:transactionId', transactionIdValidator, deleteTransaction);

module.exports = router;
