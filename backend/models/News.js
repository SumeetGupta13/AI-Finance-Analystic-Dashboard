const mongoose = require('mongoose');

const newsSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'News title is required'],
      trim: true,
      maxlength: [240, 'News title cannot exceed 240 characters'],
    },
    summary: {
      type: String,
      trim: true,
      maxlength: [2000, 'News summary cannot exceed 2000 characters'],
      default: '',
    },
    source: {
      type: String,
      required: [true, 'News source is required'],
      trim: true,
      index: true,
    },
    url: {
      type: String,
      trim: true,
      unique: true,
      sparse: true,
    },
    imageUrl: {
      type: String,
      trim: true,
      default: '',
    },
    category: {
      type: String,
      enum: ['markets', 'stocks', 'crypto', 'funds', 'macro', 'economy', 'earnings', 'general'],
      default: 'general',
      index: true,
    },
    symbols: {
      type: [String],
      default: [],
      set: (symbols) => (Array.isArray(symbols) ? symbols : [symbols])
        .map((symbol) => String(symbol || '').trim().toUpperCase())
        .filter(Boolean),
      index: true,
    },
    sentimentLabel: {
      type: String,
      enum: ['positive', 'neutral', 'negative'],
      default: 'neutral',
      index: true,
    },
    sentimentScore: {
      type: Number,
      min: [-1, 'Sentiment score cannot be less than -1'],
      max: [1, 'Sentiment score cannot exceed 1'],
      default: 0,
    },
    publishedAt: {
      type: Date,
      required: [true, 'Published date is required'],
      index: true,
    },
    provider: {
      type: String,
      trim: true,
      default: 'internal',
    },
    isActive: {
      type: Boolean,
      default: true,
      index: true,
    },
    rawPayload: {
      type: mongoose.Schema.Types.Mixed,
      default: undefined,
      select: false,
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

newsSchema.index({ publishedAt: -1, category: 1 });
newsSchema.index({ symbols: 1, publishedAt: -1 });

const News = mongoose.model('News', newsSchema);

module.exports = News;
