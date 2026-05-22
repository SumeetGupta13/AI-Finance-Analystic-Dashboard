const mongoose = require('mongoose');

const newsSentimentSchema = new mongoose.Schema({
  symbol: {
    type: String,
    required: true,
    uppercase: true,
    trim: true,
    index: true
  },
  headline: {
    type: String,
    required: true
  },
  sentimentScore: {
    type: Number, // Ranges from -1 (very negative) to 1 (very positive)
    required: true,
    min: -1,
    max: 1
  },
  source: {
    type: String,
    required: true
  },
  url: {
    type: String
  },
  publishedAt: {
    type: Date,
    required: true,
    expires: 30 * 24 * 60 * 60 // automatically delete old news after 30 days
  }
}, { 
  timestamps: true 
});

// Index to fetch recent news for a specific stock
newsSentimentSchema.index({ symbol: 1, publishedAt: -1 });

module.exports = mongoose.model('NewsSentiment', newsSentimentSchema);
