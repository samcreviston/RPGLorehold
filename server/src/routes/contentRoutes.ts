import { Router } from 'express';
import * as contentController from '../controllers/contentController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const contentRoutes = Router();

contentRoutes.get('/published/:slug', contentController.getPublicContent);

contentRoutes.use(requireAuth);
contentRoutes.get('/', contentController.listContent);
contentRoutes.post('/', contentController.createContent);
contentRoutes.get('/:id', contentController.getContent);
contentRoutes.put('/:id', contentController.updateContent);
contentRoutes.delete('/:id', contentController.deleteContent);

export default contentRoutes;
