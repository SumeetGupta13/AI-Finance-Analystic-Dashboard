const { validationResult } = require('express-validator');

const validateRequest = (req, res, next) => {
  const result = validationResult(req);

  if (result.isEmpty()) {
    return next();
  }

  const errors = result.array().map((error) => ({
    field: error.path || error.param,
    message: error.msg,
  }));
  const error = new Error(errors.map((item) => item.message).join(', '));
  error.statusCode = 422;
  error.errors = errors;

  res.status(422);
  return next(error);
};

module.exports = validateRequest;
