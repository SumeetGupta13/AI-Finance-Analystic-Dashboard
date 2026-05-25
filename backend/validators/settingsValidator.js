const { body } = require('express-validator');
const validateRequest = require('./validateRequest');

const profileValidator = [
  body('name').optional().trim().isLength({ min: 2, max: 80 }).withMessage('Name must be between 2 and 80 characters'),
  body('avatar').optional().trim().isURL().withMessage('Avatar must be a valid URL'),
  validateRequest,
];

const preferencesValidator = [
  body('currency').optional().isIn(['INR', 'USD']).withMessage('Currency must be INR or USD'),
  body('defaultMarket').optional().isIn(['IN', 'US', 'GLOBAL']).withMessage('Default market must be IN, US, or GLOBAL'),
  body('riskProfile').optional().isIn(['conservative', 'balanced', 'aggressive']).withMessage('Invalid risk profile'),
  validateRequest,
];

module.exports = { profileValidator, preferencesValidator };
