const mongoose = require('mongoose');

const watchlistItemSchema = new mongoose.Schema(
  {
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
    addedAt: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const watchlistSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
      minlength: [2, 'Watchlist name must be at least 2 characters'],
      maxlength: [60, 'Watchlist name cannot exceed 60 characters'],
    },
    items: {
      type: [watchlistItemSchema],
      default: [],
      validate: {
        validator(items) {
          const keys = items.map((item) => `${item.assetType}:${item.symbol}`);
          return keys.length === new Set(keys).size;
        },
        message: 'Watchlist cannot contain duplicate assets',
      },
    },
  },
  { timestamps: true }
);

watchlistSchema.index({ user: 1, name: 1 }, { unique: true });
watchlistSchema.index({ user: 1, 'items.symbol': 1 });

const Watchlist = mongoose.model('Watchlist', watchlistSchema);

module.exports = Watchlist;
