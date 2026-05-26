const { sendError } = require('../utils/apiResponse');

const notFound = (req, res, next) => {
  const error = new Error(`Route not found: ${req.originalUrl}`);
  res.status(404);
  next(error);
};

const normalizeMongooseError = (err) => {
  if (err.name === 'CastError') {
    return { statusCode: 404, message: 'Resource not found', errors: [] };
  }

  if (err.code === 11000) {
    const fields = Object.keys(err.keyValue || {});
    return {
      statusCode: 409,
      message: `${fields.join(', ') || 'Resource'} already exists`,
      errors: fields,
    };
  }

  if (err.name === 'ValidationError') {
    return {
      statusCode: 422,
      message: 'Validation failed',
      errors: Object.values(err.errors).map((item) => item.message),
    };
  }

  return null;
};

const errorHandler = (err, req, res, next) => {
  const mongooseError = normalizeMongooseError(err);
  const statusCode = mongooseError?.statusCode || err.statusCode || (res.statusCode !== 200 ? res.statusCode : 500);
  const message = mongooseError?.message || err.message || 'Internal server error';
  const errors = mongooseError?.errors || err.errors || [];

  if (process.env.NODE_ENV !== 'test') {
    console.error(`[${req.method}] ${req.originalUrl} -> ${statusCode}: ${message}`);
  }

  const response = {
    success: false,
    message,
    errors,
  };

  if (process.env.NODE_ENV !== 'production') {
    response.stack = err.stack;
  }

  return res.status(statusCode).json(response);
};

module.exports = { notFound, errorHandler };
