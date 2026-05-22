const mongoose = require('mongoose');

const fraudAlertSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true
  },
  transactionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Transaction',
    required: true
  },
  riskLevel: {
    type: String,
    enum: ['low', 'medium', 'high', 'critical'],
    required: true,
    index: true
  },
  description: {
    type: String,
    required: true
  },
  status: {
    type: String,
    enum: ['unresolved', 'investigated', 'resolved'],
    default: 'unresolved',
    index: true
  },
  resolvedAt: {
    type: Date
  }
}, { 
  timestamps: true 
});

// Index to quickly query unresolved alerts for a user
fraudAlertSchema.index({ userId: 1, status: 1, riskLevel: 1 });

module.exports = mongoose.model('FraudAlert', fraudAlertSchema);
