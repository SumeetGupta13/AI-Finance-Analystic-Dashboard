const mongoose = require('mongoose');

const holdingSchema = new mongoose.Schema(
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
    exchange: {
      type: String,
      required: true,
      trim: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: [0, 'Quantity cannot be negative'],
    },
    averagePrice: {
      type: Number,
      required: true,
      min: [0, 'Average price cannot be negative'],
    },
    lastPriceSnapshot: {
      type: Number,
      required: true,
      min: [0, 'Last price cannot be negative'],
    },
  },
  { timestamps: true }
);

holdingSchema.index({ user: 1, portfolio: 1 });
holdingSchema.index({ user: 1, symbol: 1, assetType: 1 }, { unique: true });

const Holding = mongoose.model('Holding', holdingSchema);

module.exports = Holding;
