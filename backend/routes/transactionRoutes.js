const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { buy, sell, getTransactions, getTransactionById } = require('../controllers/transactionController');
const { tradeValidator, transactionIdValidator } = require('../validators/transactionValidator');

const router = express.Router();

router.use(protect);
router.post('/buy', tradeValidator, buy);
router.post('/sell', tradeValidator, sell);
router.get('/', getTransactions);
router.get('/:transactionId', transactionIdValidator, getTransactionById);

module.exports = router;
