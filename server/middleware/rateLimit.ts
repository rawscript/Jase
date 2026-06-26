import { Request, Response, NextFunction } from 'express';

interface RateLimitStore {
  count: number;
  resetTime: number;
}

// Simple in-memory rate limiter — no external dependencies
function createRateLimiter(options: {
  windowMs: number;
  max: number;
  message: string;
}) {
  const store = new Map<string, RateLimitStore>();

  // Clean up expired entries every 5 minutes
  setInterval(() => {
    const now = Date.now();
    for (const [key, value] of store.entries()) {
      if (now > value.resetTime) store.delete(key);
    }
  }, 5 * 60 * 1000);

  return (req: Request, res: Response, next: NextFunction): void => {
    const key = req.ip || req.socket.remoteAddress || 'unknown';
    const now = Date.now();
    const entry = store.get(key);

    if (!entry || now > entry.resetTime) {
      store.set(key, { count: 1, resetTime: now + options.windowMs });
      next();
      return;
    }

    entry.count++;

    if (entry.count > options.max) {
      const retryAfter = Math.ceil((entry.resetTime - now) / 1000);
      res.setHeader('Retry-After', String(retryAfter));
      res.status(429).json({
        success: false,
        error: 'Rate limit exceeded',
        message: options.message,
        retryAfter,
      });
      return;
    }

    next();
  };
}

export const contactRateLimit = createRateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: 'Too many contact form submissions. Please try again in 15 minutes.',
});

export const chatRateLimit = createRateLimiter({
  windowMs: 60 * 1000, // 1 minute
  max: 20,
  message: 'Too many chat requests. Please slow down.',
});

export const generalRateLimit = createRateLimiter({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: 'Too many requests from this IP, please try again later.',
});
