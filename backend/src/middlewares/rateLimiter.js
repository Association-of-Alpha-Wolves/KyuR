import rateLimit from 'express-rate-limit';

/**
 * authLimiter
 * Applied to sensitive auth endpoints (register, login, forgotpassword).
 * Limits each IP to 5 requests per 15-minute window to mitigate
 * brute-force attacks and credential stuffing.
 */
export const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  standardHeaders: true,  // Return rate limit info in RateLimit-* headers
  legacyHeaders: false,   // Disable X-RateLimit-* headers
  message: {
    success: false,
    statusCode: 429,
    message: 'Too many requests from this IP, please try again after 15 minutes',
  },
});
