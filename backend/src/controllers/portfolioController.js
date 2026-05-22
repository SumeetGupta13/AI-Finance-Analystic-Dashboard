const Stock = require('../models/Stock');
const portfolioService = require('../services/portfolioService');

/**
 * @desc    Get user portfolio with total investment, current value, P/L
 * @route   GET /api/portfolio
 * @access  Private
 */
const getUserPortfolio = async (req, res, next) => {
  try {
    const data = await portfolioService.getPortfolioDetails(req.user._id);
    res.json({ success: true, data });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Add stock to portfolio
 * @route   POST /api/portfolio
 * @access  Private
 */
const addStock = async (req, res, next) => {
  try {
    const { symbol, companyName, shares, averagePurchasePrice, currentPrice } = req.body;
    
    if (!symbol || !companyName || shares === undefined || averagePurchasePrice === undefined) {
      res.status(400);
      throw new Error('Please provide symbol, companyName, shares, and averagePurchasePrice');
    }

    const portfolio = await portfolioService.getDefaultPortfolio(req.user._id);

    // Check if stock already exists in this portfolio
    let stock = await Stock.findOne({ portfolioId: portfolio._id, symbol: symbol.toUpperCase() });

    if (stock) {
      res.status(400);
      throw new Error('Stock already exists in portfolio. Use the update endpoint to modify shares/price.');
    }

    stock = await Stock.create({
      userId: req.user._id,
      portfolioId: portfolio._id,
      symbol: symbol.toUpperCase(),
      companyName,
      shares,
      averagePurchasePrice,
      currentPrice: currentPrice || averagePurchasePrice // Fallback if no real-time price provided
    });

    res.status(201).json({ success: true, data: stock });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Update quantity/buy price
 * @route   PUT /api/portfolio/:id
 * @access  Private
 */
const updateStock = async (req, res, next) => {
  try {
    const { shares, averagePurchasePrice, currentPrice } = req.body;
    
    let stock = await Stock.findById(req.params.id);

    if (!stock) {
      res.status(404);
      throw new Error('Stock not found');
    }

    if (stock.userId.toString() !== req.user._id.toString()) {
      res.status(401);
      throw new Error('User not authorized to modify this asset');
    }

    stock = await Stock.findByIdAndUpdate(
      req.params.id,
      { shares, averagePurchasePrice, currentPrice },
      { new: true, runValidators: true }
    );

    res.json({ success: true, data: stock });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Remove stock from portfolio
 * @route   DELETE /api/portfolio/:id
 * @access  Private
 */
const removeStock = async (req, res, next) => {
  try {
    const stock = await Stock.findById(req.params.id);

    if (!stock) {
      res.status(404);
      throw new Error('Stock not found');
    }

    if (stock.userId.toString() !== req.user._id.toString()) {
      res.status(401);
      throw new Error('User not authorized to delete this asset');
    }

    await stock.deleteOne();

    res.json({ success: true, message: 'Stock successfully removed from portfolio' });
  } catch (error) {
    next(error);
  }
};

/**
 * @desc    Get asset allocation data
 * @route   GET /api/portfolio/analytics
 * @access  Private
 */
const getPortfolioAnalytics = async (req, res, next) => {
  try {
    const allocation = await portfolioService.getAssetAllocation(req.user._id);
    res.json({ success: true, data: allocation });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  getUserPortfolio,
  addStock,
  updateStock,
  removeStock,
  getPortfolioAnalytics
};
