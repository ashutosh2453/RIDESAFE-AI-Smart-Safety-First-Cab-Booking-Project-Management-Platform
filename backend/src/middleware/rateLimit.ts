import rateLimit from 'express-rate-limit';

export const authRateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // Limit each IP to 30 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many authentication attempts. Please try again after 15 minutes.',
    error: 'TOO_MANY_REQUESTS',
  },
});

export const aiRateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 20, // 20 requests per minute
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'Too many AI Assistant requests. Please slow down.',
    error: 'TOO_MANY_REQUESTS',
  },
});

export const sosRateLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 10, // 10 SOS calls per 5 minutes to prevent spam
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: 'SOS trigger limit reached for current window.',
    error: 'TOO_MANY_REQUESTS',
  },
});
