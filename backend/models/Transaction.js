const mongoose = require('mongoose');

const transactionTypes = ['income', 'expense', 'investment', 'savings', 'stock_buy', 'stock_sell', 'buy', 'sell'];

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
      index: true,
    },
    type: {
      type: String,
      enum: transactionTypes,
      required: true,
      index: true,
    },
    category: {
      type: String,
      required: true,
      trim: true,
      maxlength: [80, 'Category cannot exceed 80 characters'],
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: [140, 'Title cannot exceed 140 characters'],
    },
    amount: {
      type: Number,
      required: true,
      min: [0, 'Amount cannot be negative'],
    },
    assetType: {
      type: String,
      enum: ['stock', 'crypto', 'mutual_fund', 'cash'],
      default: 'cash',
    },
    symbol: {
      type: String,
      default: '',
      uppercase: true,
      trim: true,
      index: true,
    },
    stockSymbol: {
      type: String,
      default: '',
      uppercase: true,
      trim: true,
      index: true,
    },
    name: {
      type: String,
      default: '',
      trim: true,
    },
    stockName: {
      type: String,
      default: '',
      trim: true,
    },
    quantity: {
      type: Number,
      default: 0,
      min: [0, 'Quantity cannot be negative'],
    },
    price: {
      type: Number,
      default: 0,
      min: [0, 'Price cannot be negative'],
    },
    grossAmount: {
      type: Number,
      default: 0,
      min: [0, 'Gross amount cannot be negative'],
    },
    charges: {
      type: Number,
      default: 0,
      min: [0, 'Charges cannot be negative'],
    },
    netAmount: {
      type: Number,
      default: 0,
      min: [0, 'Net amount cannot be negative'],
    },
    totalValue: {
      type: Number,
      default: 0,
      min: [0, 'Total value cannot be negative'],
    },
    fees: {
      type: Number,
      default: 0,
      min: [0, 'Fees cannot be negative'],
    },
    profitLoss: {
      type: Number,
      default: 0,
    },
    paymentMethod: {
      type: String,
      default: 'virtual_wallet',
      trim: true,
      maxlength: [80, 'Payment method cannot exceed 80 characters'],
    },
    notes: {
      type: String,
      default: '',
      trim: true,
      maxlength: [500, 'Notes cannot exceed 500 characters'],
    },
    transactionDate: {
      type: Date,
      default: Date.now,
      index: true,
    },
    month: {
      type: Number,
      min: [1, 'Month must be between 1 and 12'],
      max: [12, 'Month must be between 1 and 12'],
      index: true,
    },
    year: {
      type: Number,
      min: [1970, 'Year must be valid'],
      index: true,
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
transactionSchema.index({ user: 1, year: 1, month: 1, transactionDate: -1 });

transactionSchema.pre('validate', function hydrateDerivedFields(next) {
  const transactionDate = this.transactionDate ? new Date(this.transactionDate) : new Date();
  this.transactionDate = transactionDate;
  this.month = this.month || transactionDate.getMonth() + 1;
  this.year = this.year || transactionDate.getFullYear();

  if (this.type === 'buy') this.type = 'stock_buy';
  if (this.type === 'sell') this.type = 'stock_sell';

  const symbol = this.stockSymbol || this.symbol || '';
  const name = this.stockName || this.name || this.title || '';
  this.symbol = symbol;
  this.stockSymbol = symbol;
  this.name = name;
  this.stockName = name;
  this.totalValue = this.totalValue || this.grossAmount || Number((this.quantity * this.price).toFixed(2)) || this.amount || 0;
  this.fees = this.fees || this.charges || 0;
  this.grossAmount = this.grossAmount || this.totalValue || this.amount || 0;
  this.charges = this.charges || this.fees || 0;
  this.netAmount = this.netAmount || this.amount || Number((this.grossAmount + this.charges).toFixed(2));
  this.amount = this.amount || this.netAmount || this.totalValue || 0;

  next();
});

const Transaction = mongoose.model('Transaction', transactionSchema);

module.exports = Transaction;
