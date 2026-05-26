const mongoose = require('mongoose');

const aiInsightSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      index: true,
    },
    portfolio: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Portfolio',
      index: true,
    },
    title: {
      type: String,
      required: [true, 'Insight title is required'],
      trim: true,
      maxlength: [140, 'Insight title cannot exceed 140 characters'],
    },
    summary: {
      type: String,
      required: [true, 'Insight summary is required'],
      trim: true,
      maxlength: [2000, 'Insight summary cannot exceed 2000 characters'],
    },
    category: {
      type: String,
      enum: ['portfolio', 'risk', 'opportunity', 'sentiment', 'market', 'watchlist'],
      required: true,
      index: true,
    },
    recommendation: {
      type: String,
      enum: ['buy', 'sell', 'hold', 'watch', 'rebalance', 'info'],
      default: 'info',
      index: true,
    },
    confidence: {
      type: Number,
      min: [0, 'Confidence cannot be less than 0'],
      max: [1, 'Confidence cannot exceed 1'],
      default: 0,
    },
    symbols: {
      type: [String],
      default: [],
      set: (symbols) => (Array.isArray(symbols) ? symbols : [symbols])
        .map((symbol) => String(symbol || '').trim().toUpperCase())
        .filter(Boolean),
    },
    source: {
      type: String,
      enum: ['system', 'market-service', 'ai-service', 'admin'],
      default: 'system',
    },
    status: {
      type: String,
      enum: ['draft', 'active', 'archived'],
      default: 'active',
      index: true,
    },
    metadata: {
      type: mongoose.Schema.Types.Mixed,
      default: {},
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

aiInsightSchema.index({ user: 1, createdAt: -1 });
aiInsightSchema.index({ symbols: 1, category: 1, status: 1 });

const AIInsight = mongoose.model('AIInsight', aiInsightSchema);

module.exports = AIInsight;
