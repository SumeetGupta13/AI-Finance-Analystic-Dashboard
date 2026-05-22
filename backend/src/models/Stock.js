const mongoose = require('mongoose');

const stockSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  portfolioId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Portfolio',
    required: true,
    index: true
  },
  symbol: {
    type: String,
    required: [true, 'Please provide a stock symbol'],
    uppercase: true,
    trim: true,
    index: true
  },
  companyName: {
    type: String,
    required: [true, 'Please provide the company name']
  },
  shares: {
    type: Number,
    required: [true, 'Please specify the number of shares'],
    min: [0, 'Shares cannot be negative']
  },
  averagePurchasePrice: {
    type: Number,
    required: [true, 'Please specify the average purchase price'],
    min: [0, 'Price cannot be negative']
  },
  currentPrice: {
    type: Number,
    min: [0, 'Price cannot be negative']
  }
}, { 
  timestamps: true 
});

// Compound index to ensure uniqueness of a stock symbol within a specific portfolio
stockSchema.index({ portfolioId: 1, symbol: 1 }, { unique: true });

module.exports = mongoose.model('Stock', stockSchema);
