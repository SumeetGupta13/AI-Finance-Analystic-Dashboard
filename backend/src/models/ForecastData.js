const mongoose = require('mongoose');

const forecastDataSchema = new mongoose.Schema({
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
  targetDate: {
    type: Date,
    required: [true, 'Forecast must have a target date'],
    index: true
  },
  predictedValue: {
    type: Number,
    required: true
  },
  lowerBound: {
    type: Number,
    required: true
  },
  upperBound: {
    type: Number,
    required: true
  },
  modelUsed: {
    type: String,
    required: true,
    default: 'ARIMA'
  },
  confidenceInterval: {
    type: Number,
    default: 0.95
  }
}, { 
  timestamps: true 
});

// Index to quickly query forecasts for a user by date
forecastDataSchema.index({ userId: 1, targetDate: 1 });

module.exports = mongoose.model('ForecastData', forecastDataSchema);
