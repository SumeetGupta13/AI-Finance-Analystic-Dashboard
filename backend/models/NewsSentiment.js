const mongoose = require('mongoose');

const normalizeNewsSnippets = (items) => (Array.isArray(items) ? items : [items])
  .filter(Boolean)
  .map((item) => (typeof item === 'string' ? { text: item } : item));

const newsSnippetSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: true,
      trim: true,
      maxlength: [300, 'News snippet cannot exceed 300 characters'],
    },
    source: {
      type: String,
      trim: true,
      default: '',
    },
  },
  { _id: false }
);

const newsSentimentSchema = new mongoose.Schema(
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
    sentiment: {
      type: String,
      enum: ['Positive', 'Neutral', 'Negative'],
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
      required: true,
      min: [-1, 'Sentiment score cannot be less than -1'],
      max: [1, 'Sentiment score cannot exceed 1'],
    },
    confidence: {
      type: Number,
      required: true,
      min: [0, 'Confidence cannot be less than 0'],
      max: [100, 'Confidence cannot exceed 100'],
    },
    reason: {
      type: String,
      required: [true, 'Sentiment reason is required'],
      trim: true,
      maxlength: [1000, 'Sentiment reason cannot exceed 1000 characters'],
    },
    newsImpact: {
      type: Number,
      default: 0,
      min: [-20, 'News impact cannot be less than -20'],
      max: [20, 'News impact cannot exceed 20'],
    },
    positiveNews: {
      type: [newsSnippetSchema],
      default: [],
      set: normalizeNewsSnippets,
    },
    negativeNews: {
      type: [newsSnippetSchema],
      default: [],
      set: normalizeNewsSnippets,
    },
    neutralNews: {
      type: [newsSnippetSchema],
      default: [],
      set: normalizeNewsSnippets,
    },
    provider: {
      type: String,
      trim: true,
      default: 'stockiq',
    },
    updatedAtProvider: {
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

newsSentimentSchema.index({ symbol: 1, assetType: 1, updatedAtProvider: -1 });
newsSentimentSchema.index({ sentiment: 1, confidence: -1 });

const NewsSentiment = mongoose.model('NewsSentiment', newsSentimentSchema);

module.exports = NewsSentiment;
