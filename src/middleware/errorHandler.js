const { errorResponse } = require('../utils/response');

const errorHandler = (err, req, res, next) => {
  console.error(err);

  if (err.name === 'CastError') {
    return errorResponse(res, 400, 'Invalid ID format');
  }

  if (err.name === 'ValidationError') {
    const message = Object.values(err.errors)[0]?.message || 'Validation failed';
    return errorResponse(res, 400, message);
  }

  if (err.name === 'MongoServerError' && err.code === 11000) {
    const field = Object.keys(err.keyPattern || {})[0] || 'field';
    return errorResponse(res, 409, `${field} already exists`);
  }

  const statusCode = err.statusCode || 500;
  const message = process.env.NODE_ENV === 'production'
    ? 'Internal server error'
    : (err.message || 'Something went wrong');

  return errorResponse(res, statusCode, message);
};

module.exports = errorHandler;
