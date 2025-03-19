const rateLimit = require('express-rate-limit');
const RedisStore = require('rate-limit-redis');
const Redis = require('ioredis');
const { logger } = require('./logger');

// Create Redis client
const redis = new Redis({
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT || 6379,
  password: process.env.REDIS_PASSWORD,
  retryStrategy: (times) => {
    const delay = Math.min(times * 50, 2000);
    return delay;
  }
});

redis.on('error', (err) => {
  logger.error('Redis error:', err);
});

redis.on('connect', () => {
  logger.info('Connected to Redis');
});

// Default rate limit options
const defaultOptions = {
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // Limit each IP to 100 requests per windowMs
  standardHeaders: true, // Return rate limit info in the `RateLimit-*` headers
  legacyHeaders: false, // Disable the `X-RateLimit-*` headers
  handler: (req, res) => {
    res.status(429).json({
      error: 'Too many requests, please try again later.',
      retryAfter: res.getHeader('Retry-After')
    });
  },
  store: new RedisStore({
    sendCommand: (...args) => redis.call(...args)
  })
};

// Create different rate limiters for different use cases
const rateLimiters = {
  // General API rate limiter
  api: rateLimit({
    ...defaultOptions,
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100 // 100 requests per 15 minutes
  }),

  // Authentication rate limiter (login, register, password reset)
  auth: rateLimit({
    ...defaultOptions,
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 5, // 5 attempts per hour
    skipSuccessfulRequests: true // Don't count successful requests
  }),

  // Search rate limiter
  search: rateLimit({
    ...defaultOptions,
    windowMs: 60 * 1000, // 1 minute
    max: 30 // 30 searches per minute
  }),

  // File upload rate limiter
  upload: rateLimit({
    ...defaultOptions,
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 10 // 10 uploads per hour
  })
};

// Dynamic rate limiter based on user role
const createUserRoleLimiter = (roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return rateLimiters.api(req, res, next);
    }

    const userRole = req.user.role;
    let limit;

    if (roles[userRole]) {
      limit = roles[userRole];
    } else {
      limit = roles.default || defaultOptions.max;
    }

    rateLimit({
      ...defaultOptions,
      max: limit
    })(req, res, next);
  };
};

// Example usage of role-based rate limiting
const roleBasedLimiter = createUserRoleLimiter({
  admin: 1000,
  teacher: 500,
  parent: 200,
  default: 100
});

// Burst protection for specific endpoints
const burstLimiter = rateLimit({
  ...defaultOptions,
  windowMs: 1000, // 1 second
  max: 5, // 5 requests per second
  skipFailedRequests: true
});

// Export rate limiters and utilities
module.exports = {
  rateLimiters,
  createUserRoleLimiter,
  roleBasedLimiter,
  burstLimiter,
  redis // Export redis client for use in other parts of the application
}; 