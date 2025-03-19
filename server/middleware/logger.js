const winston = require('winston');
const morgan = require('morgan');
const path = require('path');

// Configure Winston logger
const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp(),
    winston.format.json()
  ),
  transports: [
    // Write all logs to console
    new winston.transports.Console({
      format: winston.format.combine(
        winston.format.colorize(),
        winston.format.simple()
      )
    }),
    // Write all logs with level 'error' and below to 'error.log'
    new winston.transports.File({
      filename: path.join(__dirname, '../logs/error.log'),
      level: 'error'
    }),
    // Write all logs with level 'info' and below to 'combined.log'
    new winston.transports.File({
      filename: path.join(__dirname, '../logs/combined.log')
    })
  ],
  // Handle uncaught exceptions
  exceptionHandlers: [
    new winston.transports.File({
      filename: path.join(__dirname, '../logs/exceptions.log')
    })
  ],
  // Handle unhandled promise rejections
  rejectionHandlers: [
    new winston.transports.File({
      filename: path.join(__dirname, '../logs/rejections.log')
    })
  ]
});

// Create a stream object for Morgan
const stream = {
  write: (message) => logger.info(message.trim())
};

// Configure Morgan format
const morganFormat = process.env.NODE_ENV === 'production'
  ? 'combined'
  : 'dev';

// Create Morgan middleware
const httpLogger = morgan(morganFormat, { stream });

// Error logging middleware
const errorLogger = (err, req, res, next) => {
  logger.error({
    message: err.message,
    stack: err.stack,
    method: req.method,
    url: req.url,
    body: req.body,
    query: req.query,
    params: req.params,
    user: req.user ? req.user._id : null,
    timestamp: new Date().toISOString()
  });
  next(err);
};

// Request context middleware
const requestContext = (req, res, next) => {
  const requestId = req.headers['x-request-id'] || require('uuid').v4();
  const context = {
    requestId,
    method: req.method,
    url: req.url,
    startTime: Date.now()
  };

  // Add context to request object
  req.context = context;

  // Log request start
  logger.info({
    message: 'Request started',
    ...context,
    headers: req.headers,
    query: req.query,
    params: req.params
  });

  // Log request end
  res.on('finish', () => {
    const duration = Date.now() - context.startTime;
    logger.info({
      message: 'Request completed',
      ...context,
      statusCode: res.statusCode,
      duration
    });
  });

  next();
};

// Performance monitoring middleware
const performanceMonitor = (req, res, next) => {
  const start = process.hrtime();

  res.on('finish', () => {
    const duration = process.hrtime(start);
    const durationMs = (duration[0] * 1000) + (duration[1] / 1e6);

    if (durationMs > 1000) { // Log slow requests (>1s)
      logger.warn({
        message: 'Slow request detected',
        method: req.method,
        url: req.url,
        duration: durationMs,
        user: req.user ? req.user._id : null
      });
    }
  });

  next();
};

// API request rate monitoring
const requestRateMonitor = (() => {
  const requestCounts = new Map();
  const WINDOW_SIZE = 60000; // 1 minute
  const THRESHOLD = 1000; // requests per minute

  setInterval(() => {
    const cutoff = Date.now() - WINDOW_SIZE;
    for (const [ip, timestamps] of requestCounts.entries()) {
      const validTimestamps = timestamps.filter(ts => ts > cutoff);
      if (validTimestamps.length === 0) {
        requestCounts.delete(ip);
      } else {
        requestCounts.set(ip, validTimestamps);
      }
    }
  }, WINDOW_SIZE);

  return (req, res, next) => {
    const ip = req.ip;
    const now = Date.now();
    
    if (!requestCounts.has(ip)) {
      requestCounts.set(ip, []);
    }
    
    const timestamps = requestCounts.get(ip);
    timestamps.push(now);

    const cutoff = now - WINDOW_SIZE;
    const recentRequests = timestamps.filter(ts => ts > cutoff);
    
    if (recentRequests.length > THRESHOLD) {
      logger.warn({
        message: 'High request rate detected',
        ip,
        requestCount: recentRequests.length,
        windowSize: WINDOW_SIZE
      });
    }

    next();
  };
})();

module.exports = {
  logger,
  httpLogger,
  errorLogger,
  requestContext,
  performanceMonitor,
  requestRateMonitor
}; 