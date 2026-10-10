const successResponse = (res, statusCode = 200, message = 'Operation successful', data = {}) => {
  return res.status(statusCode).json({
    success: true,
    message,
    data,
  });
};

const errorResponse = (res, statusCode = 400, message = 'Something went wrong') => {
  return res.status(statusCode).json({
    success: false,
    message,
  });
};

module.exports = {
  successResponse,
  errorResponse,
};
