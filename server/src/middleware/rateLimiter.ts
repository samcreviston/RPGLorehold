import { rateLimit } from 'express-rate-limit';
import { env } from '../config/env.js';

export const aiRateLimiter = rateLimit({
	windowMs: env.AI_RATE_LIMIT_WINDOW_MS,
	limit: env.AI_RATE_LIMIT_MAX_REQUESTS,
	standardHeaders: 'draft-8',
	legacyHeaders: false,
	keyGenerator: (req) => req.user?.id ?? req.ip ?? 'anonymous',
	message: { error: 'Too many AI requests. Please try again in a minute.' }
});
