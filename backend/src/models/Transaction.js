const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  portfolioId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Portfolio',
    index: true
  },
  type: {
    type: String,
    enum: ['buy', 'sell', 'deposit', 'withdrawal', 'income', 'expense'],
    required: [true, 'Please specify the transaction type'],
    index: true
  },
  amount: {
    type: Number,
    required: [true, 'Please specify the transaction amount']
  },
  category: {
    type: String,
    trim: true,
    maxlength: [50, 'Category cannot exceed 50 characters']
  },
  tags: {
    type: [String],
    default: []
  },
  shares: {
    type: Number,
    min: [0, 'Shares cannot be negative']
  },
  symbol: {
    type: String,
    uppercase: true,
    trim: true
  },
  status: {
    type: String,
    enum: ['pending', 'completed', 'failed'],
    default: 'completed',
    index: true
  },
  date: {
    type: Date,
    default: Date.now,
    index: true
  },
  description: {
    type: String,
    maxlength: 200
  }
}, { 
  timestamps: true 
});

// Compound index for generating time-series charts and aggregations efficiently
transactionSchema.index({ userId: 1, date: -1, type: 1 });

module.exports = mongoose.model('Transaction', transactionSchema);
