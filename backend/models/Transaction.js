const mongoose = require('mongoose');

const transactionSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    portfolio: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Portfolio',
      required: true,
      index: true,
    },
    type: {
      type: String,
      enum: ['buy', 'sell'],
      required: true,
    },
    assetType: {
      type: String,
      enum: ['stock', 'crypto', 'mutual_fund'],
      required: true,
    },
    symbol: {
      type: String,
      required: true,
      uppercase: true,
      trim: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: [0.000001, 'Quantity must be greater than zero'],
    },
    price: {
      type: Number,
      required: true,
      min: [0.000001, 'Price must be greater than zero'],
    },
    grossAmount: {
      type: Number,
      required: true,
      min: [0, 'Gross amount cannot be negative'],
    },
    charges: {
      type: Number,
      default: 0,
      min: [0, 'Charges cannot be negative'],
    },
    netAmount: {
      type: Number,
      required: true,
      min: [0, 'Net amount cannot be negative'],
    },
    status: {
      type: String,
      enum: ['completed', 'rejected'],
      default: 'completed',
      index: true,
    },
    rejectionReason: {
      type: String,
      default: '',
      trim: true,
    },
  },
  { timestamps: true }
);

transactionSchema.index({ user: 1, createdAt: -1 });
transactionSchema.index({ user: 1, symbol: 1, createdAt: -1 });

const Transaction = mongoose.model('Transaction', transactionSchema);

module.exports = Transaction;
