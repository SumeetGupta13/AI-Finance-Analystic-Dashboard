const mongoose = require('mongoose');

const portfolioSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Portfolio must belong to a user'],
    index: true
  },
  name: {
    type: String,
    required: [true, 'Please add a portfolio name'],
    trim: true,
    maxlength: [50, 'Name cannot be more than 50 characters']
  },
  description: {
    type: String,
    maxlength: [500, 'Description cannot be more than 500 characters']
  },
  totalValue: {
    type: Number,
    default: 0,
    min: [0, 'Total value cannot be negative']
  },
  currency: {
    type: String,
    default: 'USD',
    enum: ['USD', 'EUR', 'GBP', 'JPY']
  }
}, { 
  timestamps: true 
});

// Compound index for quick lookups by user and name
portfolioSchema.index({ userId: 1, name: 1 });

module.exports = mongoose.model('Portfolio', portfolioSchema);
