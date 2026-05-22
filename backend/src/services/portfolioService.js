const Portfolio = require('../models/Portfolio');
const Stock = require('../models/Stock');

/**
 * Gets the user's default portfolio. Creates one if it doesn't exist.
 */
const getDefaultPortfolio = async (userId) => {
  let portfolio = await Portfolio.findOne({ userId });
  if (!portfolio) {
    portfolio = await Portfolio.create({
      userId,
      name: 'My Main Portfolio',
      description: 'Default portfolio created automatically',
    });
  }
  return portfolio;
};

/**
 * Calculates metrics and returns the enriched portfolio data.
 */
const getPortfolioDetails = async (userId) => {
  const portfolio = await getDefaultPortfolio(userId);
  const stocks = await Stock.find({ portfolioId: portfolio._id });

  let totalInvestment = 0;
  let currentValue = 0;

  const enrichedStocks = stocks.map(stock => {
    const investment = stock.shares * stock.averagePurchasePrice;
    // Assuming currentPrice is updated via background job; if 0, fallback to purchase price to avoid $0 logic holes
    const currentPrice = stock.currentPrice || stock.averagePurchasePrice;
    const value = stock.shares * currentPrice;
    
    totalInvestment += investment;
    currentValue += value;

    return {
      ...stock._doc,
      investment,
      value,
      profitOrLoss: value - investment,
      profitOrLossPercentage: investment > 0 ? ((value - investment) / investment) * 100 : 0
    };
  });

  const totalProfitLoss = currentValue - totalInvestment;

  return {
    portfolio,
    stocks: enrichedStocks,
    summary: {
      totalInvestment,
      currentValue,
      totalProfitLoss,
      totalProfitLossPercentage: totalInvestment > 0 ? (totalProfitLoss / totalInvestment) * 100 : 0
    }
  };
};

/**
 * Calculates asset allocation distribution percentages.
 */
const getAssetAllocation = async (userId) => {
  const { stocks, summary } = await getPortfolioDetails(userId);
  
  if (summary.currentValue === 0) return [];

  // Group allocation by stock symbol
  const allocation = stocks.map(stock => ({
    symbol: stock.symbol,
    companyName: stock.companyName,
    value: stock.value,
    percentage: (stock.value / summary.currentValue) * 100
  }));

  // Sort by highest percentage allocated
  return allocation.sort((a, b) => b.percentage - a.percentage);
};

module.exports = {
  getDefaultPortfolio,
  getPortfolioDetails,
  getAssetAllocation
};
