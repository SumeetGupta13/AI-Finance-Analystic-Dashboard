const mongoose = require('mongoose');

const portfolioSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    cashBalance: {
      type: Number,
      default: 100000,
      min: [0, 'Cash balance cannot be negative'],
    },
    currency: {
      type: String,
      enum: ['INR', 'USD'],
      default: 'INR',
    },
    totalInvested: {
      type: Number,
      default: 0,
      min: [0, 'Total invested cannot be negative'],
    },
    realizedPnL: {
      type: Number,
      default: 0,
    },
    riskScore: {
      type: Number,
      default: 45,
      min: [0, 'Risk score cannot be less than 0'],
      max: [100, 'Risk score cannot exceed 100'],
    },
  },
  { timestamps: true }
);

portfolioSchema.index({ user: 1, updatedAt: -1 });

const Portfolio = mongoose.model('Portfolio', portfolioSchema);

module.exports = Portfolio;
