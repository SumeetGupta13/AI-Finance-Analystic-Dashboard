const mongoose = require('mongoose');

const marketTrendSchema = new mongoose.Schema(
  {
    symbol: {
      type: String,
      required: [true, 'Symbol is required'],
      uppercase: true,
      trim: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Asset name is required'],
      trim: true,
    },
    assetType: {
      type: String,
      enum: ['stock', 'crypto', 'mutual_fund'],
      required: true,
      index: true,
    },
    exchange: {
      type: String,
      required: true,
      trim: true,
      index: true,
    },
    timeframe: {
      type: String,
      enum: ['1D', '5D', '1M', '6M', '1Y', 'MAX'],
      default: '1D',
      index: true,
    },
    trend: {
      type: String,
      enum: ['uptrend', 'downtrend', 'sideways', 'volatile'],
      required: true,
      index: true,
    },
    strength: {
      type: Number,
      min: [0, 'Trend strength cannot be less than 0'],
      max: [100, 'Trend strength cannot exceed 100'],
      default: 0,
    },
    momentum: {
      type: Number,
      default: 0,
    },
    volatility: {
      type: Number,
      min: [0, 'Volatility cannot be negative'],
      default: 0,
    },
    price: {
      type: Number,
      min: [0, 'Price cannot be negative'],
      required: true,
    },
    changePercent: {
      type: Number,
      required: true,
    },
    movingAverages: {
      sma20: { type: Number, default: null },
      sma50: { type: Number, default: null },
      sma200: { type: Number, default: null },
    },
    support: {
      type: Number,
      default: null,
    },
    resistance: {
      type: Number,
      default: null,
    },
    computedAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
    expiresAt: {
      type: Date,
      index: true,
    },
  },
  {
    timestamps: true,
    toJSON: {
      transform(doc, ret) {
        delete ret.__v;
        return ret;
      },
    },
  }
);

marketTrendSchema.index({ symbol: 1, assetType: 1, timeframe: 1, computedAt: -1 });
marketTrendSchema.index({ trend: 1, strength: -1 });

const MarketTrend = mongoose.model('MarketTrend', marketTrendSchema);

module.exports = MarketTrend;
