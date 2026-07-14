import { Router } from 'express';
import * as moduleController from '../controllers/moduleController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const moduleRoutes = Router();

moduleRoutes.get('/published/:id', moduleController.getPublishedModule);

moduleRoutes.use(requireAuth);

moduleRoutes.get('/', moduleController.listModules);
moduleRoutes.get('/favorites', moduleController.listFavoriteModules);
moduleRoutes.post('/', moduleController.createModule);
moduleRoutes.post('/publish', moduleController.publishModule);
moduleRoutes.get('/:id', moduleController.getModule);
moduleRoutes.put('/:id', moduleController.updateModule);
moduleRoutes.post('/:id/publish', moduleController.publishModule);
moduleRoutes.post('/:id/favorite', moduleController.addFavorite);
moduleRoutes.delete('/:id/favorite', moduleController.removeFavorite);
moduleRoutes.delete('/:id', moduleController.deleteModule);

export default moduleRoutes;
