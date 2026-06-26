import rateLimit from 'express-rate-limit';

interface RateLimitOptions {
  windowMs?: number;
  max?: number;
  message?: string;
}

export const rateLimit = (options: RateLimitOptions = {}) => {
  const {
    windowMs = parseInt(process.env.RATE_LIMIT_WINDOW_MS || '900000'), // 15 minutes default
    max = parseInt(process.env.RATE_LIMIT_MAX_REQUESTS || '100'),
    message = 'Too many requests from this IP, please try again later.',
  } = options;

  return rateLimit({
    windowMs,
    max,
    message: { error: message },
    standardHeaders: true,
    legacyHeaders: false,
    skipSuccessfulRequests: false,
    keyGenerator: (req) => {
      // Use IP address as key
      return req.ip || req.connection.remoteAddress || 'unknown';
    },
    handler: (req, res) => {
      res.status(429).json({
        success: false,
        error: 'Rate limit exceeded',
        message,
        retryAfter: Math.ceil(windowMs / 1000),
      });
    },
  });
};

// Specific rate limiters for different endpoints
export const conversationRateLimit = rateLimit({
  windowMs: 60000, // 1 minute
  max: 20, // 20 requests per minute
  message: 'Too many conversation requests, please slow down.',
});

export const contactRateLimit = rateLimit({
  windowMs: 900000, // 15 minutes
  max: 5, // 5 contact form submissions per 15 minutes
  message: 'Too many contact form submissions, please try again later.',
});

export const authRateLimit = rateLimit({
  windowMs: 300000, // 5 minutes
  max: 10, // 10 authentication attempts per 5 minutes
  message: 'Too many authentication attempts, please try again later.',
});