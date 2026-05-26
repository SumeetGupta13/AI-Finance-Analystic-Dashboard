const dashboardService = require('../services/dashboardService');
const asyncHandler = require('../utils/asyncHandler');
const { sendSuccess } = require('../utils/apiResponse');

const getSummary = asyncHandler(async (req, res) => {
  const data = await dashboardService.getSummary(req.user._id, req.query);
  return sendSuccess(res, 200, 'Dashboard summary loaded successfully', data);
});

module.exports = {
  getSummary,
};
