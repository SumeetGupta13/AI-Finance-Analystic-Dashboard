const mongoose = require('mongoose');

const sentimentSignalSchema = new mongoose.Schema(
  {
    source: {
      type: String,
      required: true,
      trim: true,
    },
    label: {
      type: String,
      enum: ['bullish', 'neutral', 'bearish'],
      required: true,
    },
    score: {
      type: Number,
      min: [-1, 'Signal score cannot be less than -1'],
      max: [1, 'Signal score cannot exceed 1'],
      required: true,
    },
    weight: {
      type: Number,
      min: [0, 'Signal weight cannot be less than 0'],
      max: [1, 'Signal weight cannot exceed 1'],
      default: 1,
    },
  },
  { _id: false }
);

const sentimentSchema = new mongoose.Schema(
  {
    symbol: {
      type: String,
      required: [true, 'Symbol is required'],
      uppercase: true,
      trim: true,
      index: true,
    },
    assetType: {
      type: String,
      enum: ['stock', 'crypto', 'mutual_fund'],
      required: true,
      index: true,
    },
    label: {
      type: String,
      enum: ['bullish', 'neutral', 'bearish'],
      required: true,
      index: true,
    },
    score: {
      type: Number,
      min: [-1, 'Sentiment score cannot be less than -1'],
      max: [1, 'Sentiment score cannot exceed 1'],
      required: true,
    },
    confidence: {
      type: Number,
      min: [0, 'Confidence cannot be less than 0'],
      max: [1, 'Confidence cannot exceed 1'],
      default: 0,
    },
    window: {
      type: String,
      enum: ['1h', '1d', '7d', '30d'],
      default: '1d',
      index: true,
    },
    signals: {
      type: [sentimentSignalSchema],
      default: [],
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
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
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

sentimentSchema.index({ symbol: 1, assetType: 1, window: 1, computedAt: -1 });

const Sentiment = mongoose.model('Sentiment', sentimentSchema);

module.exports = Sentiment;
