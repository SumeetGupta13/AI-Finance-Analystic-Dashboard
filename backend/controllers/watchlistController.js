const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const Watchlist = require('../models/Watchlist');
const marketService = require('../services/marketService');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/apiResponse');

const dataDirectory = path.join(__dirname, '..', 'data');
const watchlistsFilePath = path.join(dataDirectory, 'watchlists.json');
const useMockDatabase = () => process.env.NODE_ENV !== 'production' && mongoose.connection.readyState !== 1;
const getMockWatchlists = () =>
  JSON.parse(fs.readFileSync(watchlistsFilePath, 'utf8')).map((watchlist, index) => ({
    _id: watchlist._id || watchlist.id || `mock_watchlist_${index + 1}`,
    id: watchlist.id || watchlist._id || `mock_watchlist_${index + 1}`,
    ...watchlist,
    items: Array.isArray(watchlist.items) ? watchlist.items : [],
  }));

const writeMockWatchlists = (watchlists) => {
  const payload = watchlists.map((watchlist) => ({
    id: watchlist.id || watchlist._id,
    name: watchlist.name,
    items: Array.isArray(watchlist.items) ? watchlist.items : [],
  }));

  fs.writeFileSync(watchlistsFilePath, `${JSON.stringify(payload, null, 2)}\n`);
};

const findMockWatchlist = (watchlistId) => {
  const watchlists = getMockWatchlists();
  return {
    watchlists,
    watchlist: watchlists.find((item) => item._id === watchlistId || item.id === watchlistId),
  };
};

const getWatchlists = asyncHandler(async (req, res) => {
  if (useMockDatabase()) {
    const watchlists = getMockWatchlists();
    return sendSuccess(res, 200, 'Watchlists loaded successfully', watchlists, { count: watchlists.length });
  }

  const watchlists = await Watchlist.find({ user: req.user._id }).sort({ updatedAt: -1 });
  return sendSuccess(res, 200, 'Watchlists loaded successfully', watchlists, { count: watchlists.length });
});

const ensureDefaultWatchlist = async (userId) => {
  if (useMockDatabase()) {
    return getMockWatchlists()[0] || {
      _id: 'mock_watchlist_default',
      name: 'Primary Watchlist',
      items: [],
    };
  }

  let watchlist = await Watchlist.findOne({ user: userId, name: 'Primary Watchlist' });

  if (!watchlist) {
    watchlist = await Watchlist.create({
      user: userId,
      name: 'Primary Watchlist',
      items: [],
    });
  }

  return watchlist;
};

const getDefaultWatchlist = asyncHandler(async (req, res) => {
  const watchlist = await ensureDefaultWatchlist(req.user._id);
  return sendSuccess(res, 200, 'Watchlist loaded successfully', watchlist);
});

const createWatchlist = asyncHandler(async (req, res) => {
  if (useMockDatabase()) {
    const watchlists = getMockWatchlists();
    const watchlist = {
      _id: `watch_local_${Date.now().toString(36)}`,
      id: `watch_local_${Date.now().toString(36)}`,
      name: req.body.name,
      items: [],
    };

    watchlists.push(watchlist);
    writeMockWatchlists(watchlists);
    return sendSuccess(res, 201, 'Watchlist created successfully', watchlist);
  }

  const watchlist = await Watchlist.create({
    user: req.user._id,
    name: req.body.name,
    items: [],
  });

  return sendSuccess(res, 201, 'Watchlist created successfully', watchlist);
});

const addWatchlistItem = asyncHandler(async (req, res) => {
  if (useMockDatabase()) {
    const { watchlists, watchlist } = findMockWatchlist(req.params.watchlistId);

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
      writeMockWatchlists(watchlists);
    }

    return sendSuccess(res, 200, 'Watchlist item saved successfully', watchlist);
  }

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

const addDefaultWatchlistItem = asyncHandler(async (req, res) => {
  if (useMockDatabase()) {
    const watchlists = getMockWatchlists();
    const watchlist =
      watchlists[0] ||
      {
        _id: 'watch_local_default',
        id: 'watch_local_default',
        name: 'Primary Watchlist',
        items: [],
      };
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

      if (!watchlists.some((item) => item._id === watchlist._id)) {
        watchlists.unshift(watchlist);
      }

      writeMockWatchlists(watchlists);
    }

    return sendSuccess(res, 200, 'Watchlist item saved successfully', watchlist);
  }

  const watchlist = await ensureDefaultWatchlist(req.user._id);
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

  if (useMockDatabase()) {
    const { watchlists, watchlist } = findMockWatchlist(req.params.watchlistId);

    if (!watchlist) {
      res.status(404);
      throw new Error('Watchlist not found');
    }

    watchlist.items = watchlist.items.filter((item) => item.symbol !== symbol);
    writeMockWatchlists(watchlists);

    return sendSuccess(res, 200, 'Watchlist item removed successfully', watchlist);
  }

  const watchlist = await Watchlist.findOne({ _id: req.params.watchlistId, user: req.user._id });

  if (!watchlist) {
    res.status(404);
    throw new Error('Watchlist not found');
  }

  watchlist.items = watchlist.items.filter((item) => item.symbol !== symbol);
  await watchlist.save();

  return sendSuccess(res, 200, 'Watchlist item removed successfully', watchlist);
});

const removeDefaultWatchlistItem = asyncHandler(async (req, res) => {
  const symbol = String(req.params.symbol).toUpperCase();

  if (useMockDatabase()) {
    const watchlists = getMockWatchlists();
    const watchlist = watchlists[0];

    if (!watchlist) {
      res.status(404);
      throw new Error('Watchlist not found');
    }

    watchlist.items = watchlist.items.filter((item) => item.symbol !== symbol);
    writeMockWatchlists(watchlists);

    return sendSuccess(res, 200, 'Watchlist item removed successfully', watchlist);
  }

  const watchlist = await ensureDefaultWatchlist(req.user._id);

  watchlist.items = watchlist.items.filter((item) => item.symbol !== symbol);
  await watchlist.save();

  return sendSuccess(res, 200, 'Watchlist item removed successfully', watchlist);
});

const deleteWatchlist = asyncHandler(async (req, res) => {
  if (useMockDatabase()) {
    const { watchlists, watchlist } = findMockWatchlist(req.params.watchlistId);

    if (!watchlist) {
      res.status(404);
      throw new Error('Watchlist not found');
    }

    writeMockWatchlists(watchlists.filter((item) => item._id !== watchlist._id));
    return sendSuccess(res, 200, 'Watchlist deleted successfully', watchlist);
  }

  const watchlist = await Watchlist.findOneAndDelete({ _id: req.params.watchlistId, user: req.user._id });

  if (!watchlist) {
    res.status(404);
    throw new Error('Watchlist not found');
  }

  return sendSuccess(res, 200, 'Watchlist deleted successfully', watchlist);
});

module.exports = {
  getWatchlists,
  getDefaultWatchlist,
  createWatchlist,
  addWatchlistItem,
  addDefaultWatchlistItem,
  removeWatchlistItem,
  removeDefaultWatchlistItem,
  deleteWatchlist,
};
