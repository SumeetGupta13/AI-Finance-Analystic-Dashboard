const { validationResult } = require('express-validator');

const validateRequest = (req, res, next) => {
  const result = validationResult(req);

  if (result.isEmpty()) {
    return next();
  }

  res.status(422);
  return next(new Error(result.array().map((error) => error.msg).join(', ')));
};

module.exports = validateRequest;
