const { logger } = require('./logger');
const mongoose = require('mongoose');

// Custom error class for API errors
class APIError extends Error {
  constructor(message, statusCode, errors = []) {
    super(message);
    this.statusCode = statusCode;
    this.errors = errors;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true;

    Error.captureStackTrace(this, this.constructor);
  }
}

// Error handler middleware
const errorHandler = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || 'error';

  // Log error
  logger.error({
    message: err.message,
    stack: err.stack,
    statusCode: err.statusCode,
    path: req.path,
    method: req.method,
    requestId: req.context?.requestId
  });

  if (process.env.NODE_ENV === 'development') {
    sendErrorDev(err, req, res);
  } else {
    let error = { ...err };
    error.message = err.message;

    // Handle specific error types
    if (error.name === 'CastError') error = handleCastErrorDB(error);
    if (error.code === 11000) error = handleDuplicateFieldsDB(error);
    if (error.name === 'ValidationError') error = handleValidationErrorDB(error);
    if (error.name === 'JsonWebTokenError') error = handleJWTError();
    if (error.name === 'TokenExpiredError') error = handleJWTExpiredError();

    sendErrorProd(error, req, res);
  }
};

// Development error response
const sendErrorDev = (err, req, res) => {
  return res.status(err.statusCode).json({
    status: err.status,
    error: err,
    message: err.message,
    stack: err.stack
  });
};

// Production error response
const sendErrorProd = (err, req, res) => {
  // Operational, trusted error: send message to client
  if (err.isOperational) {
    return res.status(err.statusCode).json({
      status: err.status,
      message: err.message,
      errors: err.errors
    });
  }
  
  // Programming or other unknown error: don't leak error details
  logger.error('ERROR 💥', err);
  return res.status(500).json({
    status: 'error',
    message: 'Something went wrong'
  });
};

// Handle Mongoose CastError (invalid ObjectId)
const handleCastErrorDB = err => {
  const message = `Invalid ${err.path}: ${err.value}`;
  return new APIError(message, 400);
};

// Handle Mongoose Duplicate Fields Error
const handleDuplicateFieldsDB = err => {
  const value = err.errmsg.match(/(["'])(\\?.)*?\1/)[0];
  const message = `Duplicate field value: ${value}. Please use another value!`;
  return new APIError(message, 400);
};

// Handle Mongoose Validation Error
const handleValidationErrorDB = err => {
  const errors = Object.values(err.errors).map(el => el.message);
  const message = `Invalid input data. ${errors.join('. ')}`;
  return new APIError(message, 400, errors);
};

// Handle JWT Error
const handleJWTError = () =>
  new APIError('Invalid token. Please log in again!', 401);

// Handle JWT Expired Error
const handleJWTExpiredError = () =>
  new APIError('Your token has expired! Please log in again.', 401);

// Handle Multer Error
const handleMulterError = err => {
  if (err.code === 'LIMIT_FILE_SIZE') {
    return new APIError('File too large. Maximum size is 5MB', 400);
  }
  if (err.code === 'LIMIT_FILE_COUNT') {
    return new APIError('Too many files. Maximum is 5 files', 400);
  }
  if (err.code === 'LIMIT_UNEXPECTED_FILE') {
    return new APIError('Unexpected file type', 400);
  }
  return new APIError('File upload error', 400);
};

// Handle Redis Error
const handleRedisError = err =>
  new APIError('Redis connection error', 500);

// Handle MongoDB Connection Error
const handleMongoError = err =>
  new APIError('Database connection error', 500);

// Catch unhandled rejections
const handleUnhandledRejection = (err) => {
  logger.error('UNHANDLED REJECTION! 💥 Shutting down...');
  logger.error(err.name, err.message);
  
  // Gracefully shutdown the server
  if (process.env.NODE_ENV === 'production') {
    setTimeout(() => {
      process.exit(1);
    }, 1000);
  }
};

// Catch uncaught exceptions
const handleUncaughtException = (err) => {
  logger.error('UNCAUGHT EXCEPTION! 💥 Shutting down...');
  logger.error(err.name, err.message);
  
  process.exit(1);
};

module.exports = {
  APIError,
  errorHandler,
  handleUnhandledRejection,
  handleUncaughtException,
  handleMulterError,
  handleRedisError,
  handleMongoError
}; 