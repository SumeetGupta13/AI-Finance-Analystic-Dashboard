require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

// Models
const User = require('./models/User');
const Portfolio = require('./models/Portfolio');
const Stock = require('./models/Stock');
const Transaction = require('./models/Transaction');
const AIInsight = require('./models/AIInsight');
const FraudAlert = require('./models/FraudAlert');
const ForecastData = require('./models/ForecastData');
const NewsSentiment = require('./models/NewsSentiment');

const MONGO_URI = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/finsight-ai';

const seedDatabase = async () => {
  try {
    await mongoose.connect(MONGO_URI);
    console.log('✅ MongoDB Connected for seeding...');

    // ── CLEAR EXISTING DATA ──
    await Promise.all([
      User.deleteMany({}),
      Portfolio.deleteMany({}),
      Stock.deleteMany({}),
      Transaction.deleteMany({}),
      AIInsight.deleteMany({}),
      FraudAlert.deleteMany({}),
      ForecastData.deleteMany({}),
      NewsSentiment.deleteMany({})
    ]);
    console.log('🗑️  Cleared all existing data.');

    // ── 1. CREATE DEMO USER ──
    const salt = await bcrypt.genSalt(12);
    const hashedPassword = await bcrypt.hash('password123', salt);

    const user = await User.create({
      name: 'Alex Morgan',
      email: 'alex@finsight.ai',
      password: hashedPassword,
      role: 'admin',
      avatar: 'https://ui-avatars.com/api/?name=Alex+Morgan&background=8B5CF6&color=fff'
    });
    console.log(`👤 Created user: ${user.email}`);

    // ── 2. CREATE PORTFOLIO ──
    const portfolio = await Portfolio.create({
      userId: user._id,
      name: 'Main Portfolio',
      description: 'Primary investment portfolio'
    });
    console.log(`📁 Created portfolio: ${portfolio.name}`);

    // ── 3. CREATE STOCKS ──
    const stocksData = [
      { symbol: 'AAPL', companyName: 'Apple Inc.',        shares: 25, averagePurchasePrice: 145.00, currentPrice: 178.50 },
      { symbol: 'GOOGL', companyName: 'Alphabet Inc.',     shares: 10, averagePurchasePrice: 120.00, currentPrice: 141.80 },
      { symbol: 'MSFT', companyName: 'Microsoft Corp.',    shares: 15, averagePurchasePrice: 310.00, currentPrice: 378.90 },
      { symbol: 'TSLA', companyName: 'Tesla Inc.',         shares: 8,  averagePurchasePrice: 250.00, currentPrice: 215.60 },
      { symbol: 'AMZN', companyName: 'Amazon.com Inc.',    shares: 12, averagePurchasePrice: 135.00, currentPrice: 178.25 },
      { symbol: 'NVDA', companyName: 'NVIDIA Corp.',       shares: 20, averagePurchasePrice: 450.00, currentPrice: 875.30 },
      { symbol: 'META', companyName: 'Meta Platforms Inc.', shares: 10, averagePurchasePrice: 280.00, currentPrice: 505.75 },
      { symbol: 'BND',  companyName: 'Vanguard Total Bond ETF', shares: 50, averagePurchasePrice: 74.00, currentPrice: 72.10 }
    ];

    const stocks = await Stock.insertMany(
      stocksData.map(s => ({ ...s, userId: user._id, portfolioId: portfolio._id }))
    );
    console.log(`📈 Created ${stocks.length} stock holdings.`);

    // ── 4. CREATE TRANSACTIONS ──
    const today = new Date();
    const txData = [
      { type: 'deposit',    amount: 50000,   description: 'Initial deposit from bank',       date: new Date(today - 90 * 86400000) },
      { type: 'buy',        amount: -3625,   description: 'Bought 25 shares of AAPL',         symbol: 'AAPL',  shares: 25, date: new Date(today - 85 * 86400000) },
      { type: 'buy',        amount: -1200,   description: 'Bought 10 shares of GOOGL',        symbol: 'GOOGL', shares: 10, date: new Date(today - 80 * 86400000) },
      { type: 'buy',        amount: -4650,   description: 'Bought 15 shares of MSFT',         symbol: 'MSFT',  shares: 15, date: new Date(today - 75 * 86400000) },
      { type: 'deposit',    amount: 25000,   description: 'Wire transfer from savings',       date: new Date(today - 60 * 86400000) },
      { type: 'buy',        amount: -2000,   description: 'Bought 8 shares of TSLA',          symbol: 'TSLA',  shares: 8,  date: new Date(today - 55 * 86400000) },
      { type: 'buy',        amount: -1620,   description: 'Bought 12 shares of AMZN',         symbol: 'AMZN',  shares: 12, date: new Date(today - 50 * 86400000) },
      { type: 'buy',        amount: -9000,   description: 'Bought 20 shares of NVDA',         symbol: 'NVDA',  shares: 20, date: new Date(today - 45 * 86400000) },
      { type: 'buy',        amount: -2800,   description: 'Bought 10 shares of META',         symbol: 'META',  shares: 10, date: new Date(today - 40 * 86400000) },
      { type: 'buy',        amount: -3700,   description: 'Bought 50 units of BND ETF',       symbol: 'BND',   shares: 50, date: new Date(today - 35 * 86400000) },
      { type: 'income',     amount: 420,     description: 'AAPL quarterly dividend',          symbol: 'AAPL',  date: new Date(today - 20 * 86400000) },
      { type: 'income',     amount: 150,     description: 'MSFT quarterly dividend',          symbol: 'MSFT',  date: new Date(today - 15 * 86400000) },
      { type: 'sell',       amount: 1800,    description: 'Sold 2 shares of TSLA',            symbol: 'TSLA',  shares: 2,  date: new Date(today - 10 * 86400000) },
      { type: 'expense',    amount: -29.99,  description: 'Bloomberg Terminal subscription',   date: new Date(today - 5 * 86400000) },
      { type: 'deposit',    amount: 10000,   description: 'Monthly payroll deposit',          date: new Date(today - 2 * 86400000) },
      { type: 'withdrawal', amount: -500,    description: 'ATM cash withdrawal',              date: new Date(today - 1 * 86400000) }
    ];

    const transactions = await Transaction.insertMany(
      txData.map(tx => ({ ...tx, userId: user._id, portfolioId: portfolio._id, status: 'completed' }))
    );
    console.log(`💰 Created ${transactions.length} transactions.`);

    // ── 5. CREATE AI INSIGHTS ──
    const insightsData = [
      {
        title: 'NVDA Momentum Signal',
        content: 'NVIDIA is showing exceptionally strong momentum driven by AI chip demand. Our model predicts continued outperformance over the next 60 days with a target price of $920.',
        category: 'technical',
        confidenceScore: 94,
        relatedSymbols: ['NVDA']
      },
      {
        title: 'Portfolio Rebalancing Opportunity',
        content: 'Your tech allocation is at 68%, significantly above the recommended 40-50% band. Consider trimming NVDA and META positions to fund bond or commodity exposure for risk mitigation.',
        category: 'risk',
        confidenceScore: 88,
        relatedSymbols: ['NVDA', 'META', 'BND']
      },
      {
        title: 'TSLA Downgrade Risk',
        content: 'Multiple analyst downgrades and slowing EV delivery numbers suggest TSLA may underperform. Consider setting a stop-loss at $200 to protect gains.',
        category: 'fundamental',
        confidenceScore: 76,
        relatedSymbols: ['TSLA']
      },
      {
        title: 'Dividend Growth Strategy',
        content: 'AAPL and MSFT both have strong dividend growth histories. Reinvesting dividends could compound returns by an estimated 2.3% annually over 5 years.',
        category: 'income',
        confidenceScore: 91,
        relatedSymbols: ['AAPL', 'MSFT']
      }
    ];

    const insights = await AIInsight.insertMany(
      insightsData.map(i => ({ ...i, userId: user._id }))
    );
    console.log(`🧠 Created ${insights.length} AI insights.`);

    // ── 6. CREATE FRAUD ALERTS ──
    const alertsData = [
      {
        description: 'Unusual login attempt detected from unrecognized IP (45.33.12.xx)',
        riskLevel: 'high',
        status: 'active',
        transactionId: transactions[transactions.length - 1]._id
      },
      {
        description: 'Large withdrawal of $500 flagged for review — exceeds daily pattern',
        riskLevel: 'medium',
        status: 'reviewing',
        transactionId: transactions[transactions.length - 2]._id
      }
    ];

    const alerts = await FraudAlert.insertMany(
      alertsData.map(a => ({ ...a, userId: user._id }))
    );
    console.log(`🚨 Created ${alerts.length} fraud alerts.`);

    // ── 7. CREATE FORECAST DATA ──
    const forecastsData = Array.from({ length: 5 }, (_, i) => ({
      userId: user._id,
      portfolioId: portfolio._id,
      targetDate: new Date(today.getTime() + (i + 1) * 7 * 86400000),
      predictedValue: 128000 + (i * 1500) + Math.round(Math.random() * 800),
      lowerBound: 125000 + (i * 1200),
      upperBound: 132000 + (i * 1800),
      modelUsed: i % 2 === 0 ? 'ARIMA' : 'LSTM',
      confidenceInterval: 95
    }));

    const forecasts = await ForecastData.insertMany(forecastsData);
    console.log(`🔮 Created ${forecasts.length} forecast data points.`);

    // ── 8. CREATE NEWS SENTIMENT ──
    const newsData = [
      { symbol: 'AAPL', title: 'Apple Vision Pro Sales Exceed Expectations',  source: 'Reuters',     sentiment: 'positive', sentimentScore: 0.87, publishedAt: new Date(today - 2 * 86400000) },
      { symbol: 'NVDA', title: 'NVIDIA Announces Next-Gen AI Chip',            source: 'Bloomberg',   sentiment: 'positive', sentimentScore: 0.95, publishedAt: new Date(today - 1 * 86400000) },
      { symbol: 'TSLA', title: 'Tesla Faces Regulatory Scrutiny in EU',        source: 'CNBC',        sentiment: 'negative', sentimentScore: -0.62, publishedAt: new Date(today - 3 * 86400000) },
      { symbol: 'MSFT', title: 'Microsoft Azure Revenue Grows 29% YoY',        source: 'TechCrunch',  sentiment: 'positive', sentimentScore: 0.78, publishedAt: new Date(today - 4 * 86400000) },
      { symbol: 'META', title: 'Meta Ad Revenue Surges on AI Targeting',       source: 'WSJ',         sentiment: 'positive', sentimentScore: 0.82, publishedAt: new Date(today - 5 * 86400000) }
    ];

    const news = await NewsSentiment.insertMany(newsData);
    console.log(`📰 Created ${news.length} news sentiment entries.`);

    console.log('\n🎉 Database seeded successfully!');
    console.log('─────────────────────────────────');
    console.log(`   Email:    alex@finsight.ai`);
    console.log(`   Password: password123`);
    console.log('─────────────────────────────────\n');

    process.exit(0);
  } catch (error) {
    console.error('❌ Seeding failed:', error.message);
    process.exit(1);
  }
};

seedDatabase();
