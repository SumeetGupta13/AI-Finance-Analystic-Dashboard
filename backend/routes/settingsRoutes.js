const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const { getSettings, updateProfile, updatePreferences } = require('../controllers/settingsController');
const { profileValidator, preferencesValidator } = require('../validators/settingsValidator');

const router = express.Router();

router.use(protect);
router.get('/', getSettings);
router.patch('/profile', profileValidator, updateProfile);
router.patch('/preferences', preferencesValidator, updatePreferences);

module.exports = router;
