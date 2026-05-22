const mongoose = require('mongoose');

const aiInsightSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  portfolioId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Portfolio',
    index: true
  },
  type: {
    type: String,
    enum: ['optimization', 'risk', 'opportunity', 'tip', 'anomaly'],
    required: true,
    index: true
  },
  title: {
    type: String,
    required: [true, 'Insight must have a title'],
    maxlength: 100
  },
  content: {
    type: String,
    required: [true, 'Insight must have content']
  },
  confidenceScore: {
    type: Number,
    min: 0,
    max: 100,
    default: 80
  },
  isRead: {
    type: Boolean,
    default: false
  }
}, { 
  timestamps: true 
});

// Index to quickly fetch unread insights or sort by latest
aiInsightSchema.index({ userId: 1, createdAt: -1 });
aiInsightSchema.index({ userId: 1, isRead: 1 });

module.exports = mongoose.model('AIInsight', aiInsightSchema);
