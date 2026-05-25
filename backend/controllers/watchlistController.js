const Watchlist = require('../models/Watchlist');
const marketService = require('../services/marketService');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/apiResponse');

const getWatchlists = asyncHandler(async (req, res) => {
  const watchlists = await Watchlist.find({ user: req.user._id }).sort({ updatedAt: -1 });
  return sendSuccess(res, 200, 'Watchlists loaded successfully', watchlists, { count: watchlists.length });
});

const createWatchlist = asyncHandler(async (req, res) => {
  const watchlist = await Watchlist.create({
    user: req.user._id,
    name: req.body.name,
    items: [],
  });

  return sendSuccess(res, 201, 'Watchlist created successfully', watchlist);
});

const addWatchlistItem = asyncHandler(async (req, res) => {
  const watchlist = await Watchlist.findOne({ _id: req.params.watchlistId, user: req.user._id });

  if (!watchlist) {
    res.status(404);
    throw new Error('Watchlist not found');
  }

  const asset = await marketService.getAssetBySymbol(req.body.symbol);

  if (!asset || asset.assetType !== req.body.assetType) {
    res.status(404);
    throw new Error('Asset not found in market universe');
  }

  const exists = watchlist.items.some((item) => item.symbol === asset.symbol && item.assetType === asset.assetType);

  if (!exists) {
    watchlist.items.push({
      assetType: asset.assetType,
      symbol: asset.symbol,
      name: asset.name,
      exchange: asset.exchange,
    });
    await watchlist.save();
  }

  return sendSuccess(res, 200, 'Watchlist item saved successfully', watchlist);
});

const removeWatchlistItem = asyncHandler(async (req, res) => {
  const symbol = String(req.params.symbol).toUpperCase();
  const watchlist = await Watchlist.findOne({ _id: req.params.watchlistId, user: req.user._id });

  if (!watchlist) {
    res.status(404);
    throw new Error('Watchlist not found');
  }

  watchlist.items = watchlist.items.filter((item) => item.symbol !== symbol);
  await watchlist.save();

  return sendSuccess(res, 200, 'Watchlist item removed successfully', watchlist);
});

const deleteWatchlist = asyncHandler(async (req, res) => {
  const watchlist = await Watchlist.findOneAndDelete({ _id: req.params.watchlistId, user: req.user._id });

  if (!watchlist) {
    res.status(404);
    throw new Error('Watchlist not found');
  }

  return sendSuccess(res, 200, 'Watchlist deleted successfully', watchlist);
});

module.exports = { getWatchlists, createWatchlist, addWatchlistItem, removeWatchlistItem, deleteWatchlist };
