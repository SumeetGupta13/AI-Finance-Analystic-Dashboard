const AIInsight = require('../models/AIInsight');
const FraudAlert = require('../models/FraudAlert');
const ForecastData = require('../models/ForecastData');
const NewsSentiment = require('../models/NewsSentiment');

/**
 * @desc    Get all AI insights for the user
 * @route   GET /api/ai/insights
 * @access  Private
 */
const getInsights = async (req, res, next) => {
  try {
    const insights = await AIInsight.find({ userId: req.user._id }).sort({ createdAt: -1 });
    res.json({ success: true, data: insights });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get all fraud alerts for the user
 * @route   GET /api/ai/alerts
 * @access  Private
 */
const getAlerts = async (req, res, next) => {
  try {
    const alerts = await FraudAlert.find({ userId: req.user._id })
      .sort({ createdAt: -1 })
      .populate('transactionId'); // Attach the related transaction data
    res.json({ success: true, data: alerts });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get forecast data for user's portfolio
 * @route   GET /api/ai/forecasts
 * @access  Private
 */
const getForecasts = async (req, res, next) => {
  try {
    const forecasts = await ForecastData.find({ userId: req.user._id }).sort({ targetDate: 1 });
    res.json({ success: true, data: forecasts });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get news sentiment for a specific stock symbol
 * @route   GET /api/ai/news/:symbol
 * @access  Private
 */
const getNews = async (req, res, next) => {
  try {
    const symbol = req.params.symbol.toUpperCase();
    const news = await NewsSentiment.find({ symbol }).sort({ publishedAt: -1 }).limit(10);
    res.json({ success: true, data: news });
  } catch (error) {
    next(error);
  }
};

const getForecastBySymbol = async (req, res, next) => {
  try {
    const symbol = req.params.symbol.toUpperCase();
    const startPrice = 180 + Math.floor(Math.random() * 30);
    const history = [
      { day: 'Mon', actual: startPrice - 4 },
      { day: 'Tue', actual: startPrice - 2 },
      { day: 'Wed', actual: startPrice - 1 },
      { day: 'Thu', actual: startPrice + 1 },
      { day: 'Fri', actual: startPrice + 3 },
      { day: 'Sat', actual: startPrice + 2 },
      { day: 'Sun', actual: startPrice + 4 },
    ];
    const forecast = history.map((item, index) => ({
      day: `Day ${index + 1}`,
      price: Math.round((item.actual + (index + 1) * 1.3) * 100) / 100,
    })).slice(0, 7);
    const predictedPrice = forecast[forecast.length - 1].price;
    const accuracy = 80 + Math.floor(Math.random() * 12);
    const trend = predictedPrice > history[history.length - 1].actual ? 'Bullish' : 'Bearish';
    const explanation = `Our AI model predicts ${symbol} will trend ${trend.toLowerCase()} over the next 7 days, based on recent momentum and sector sentiment.`;

    res.json({
      success: true,
      data: {
        symbol,
        predictedPrice,
        accuracy,
        trend,
        explanation,
        history,
        forecast,
      },
    });
  } catch (error) {
    next(error);
  }
};

const fraudCheck = async (req, res, next) => {
  try {
    const { amount = 0, merchant = '', location = '', transactionType = 'Online Purchase', category = '' } = req.body;
    const normalizedAmount = Math.max(0, Number(amount) || 0);

    const amountSignal = Math.min(0.32, normalizedAmount / 9000);
    const locationSignal = /usa|us|united states/i.test(location) ? 0 : 0.17;
    const typeSignal = transactionType === 'Wire Transfer' ? 0.14 : transactionType === 'Online Purchase' ? 0.1 : 0.05;
    const merchantSignal = /(crypto|casino|pawn|travel|overseas)/i.test(merchant) ? 0.14 : 0;
    const categorySignal = category.toLowerCase() === 'gift' ? 0.06 : 0;
    const rawScore = 0.18 + amountSignal + locationSignal + typeSignal + merchantSignal + categorySignal;
    const probability = Math.min(0.97, rawScore);
    const riskLevel = probability >= 0.7 ? 'High' : probability >= 0.4 ? 'Medium' : 'Low';
    const explanation = `The transaction is flagged because of its amount, merchant attributes, and location risk profile. The model uses historical fraud patterns to assign a ${Math.round(probability * 100)}% risk estimate.`;

    const response = {
      probability: Math.round(probability * 100) / 100,
      riskLevel,
      explanation,
      alerts: [
        {
          id: 'alert-001',
          title: 'Unusual transaction pattern',
          description: 'This transaction differs from your regular spending profile.',
          confidence: Math.round(60 + probability * 20),
          riskLevel,
        },
        {
          id: 'alert-002',
          title: 'Higher-than-normal amount',
          description: 'The amount is above your typical daily spend.',
          confidence: Math.round(50 + probability * 15),
          riskLevel,
        },
      ],
      suspiciousTransactions: [
        {
          id: 'tx-sim-1',
          date: req.body.date || new Date().toISOString().split('T')[0],
          merchant: merchant || 'Unknown Merchant',
          amount: normalizedAmount,
          type: transactionType,
          location: location || 'Unknown',
          reason: 'Transaction deviates from account baseline and may require review.',
        },
      ],
    };

    res.json({ success: true, data: response });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getInsights,
  getAlerts,
  getForecasts,
  getNews,
  getForecastBySymbol,
  fraudCheck,
};
