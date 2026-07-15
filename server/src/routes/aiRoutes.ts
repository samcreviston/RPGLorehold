import { Router } from 'express';
import * as aiController from '../controllers/aiController.js';
import { requireAuth } from '../middleware/authMiddleware.js';
import { aiRateLimiter } from '../middleware/rateLimiter.js';

const aiRoutes = Router();

aiRoutes.use(requireAuth);
aiRoutes.use(aiRateLimiter);
aiRoutes.post('/generate', aiController.generate);

export default aiRoutes;
