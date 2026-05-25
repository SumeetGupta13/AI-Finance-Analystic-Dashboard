const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const {
  getWatchlists,
  createWatchlist,
  addWatchlistItem,
  removeWatchlistItem,
  deleteWatchlist,
} = require('../controllers/watchlistController');
const {
  createWatchlistValidator,
  addWatchlistItemValidator,
  watchlistIdValidator,
  removeWatchlistItemValidator,
} = require('../validators/watchlistValidator');

const router = express.Router();

router.use(protect);
router.get('/', getWatchlists);
router.post('/', createWatchlistValidator, createWatchlist);
router.post('/:watchlistId/items', addWatchlistItemValidator, addWatchlistItem);
router.delete('/:watchlistId/items/:symbol', removeWatchlistItemValidator, removeWatchlistItem);
router.delete('/:watchlistId', watchlistIdValidator, deleteWatchlist);

module.exports = router;
