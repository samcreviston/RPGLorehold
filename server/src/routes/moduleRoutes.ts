import { Router } from 'express';
import * as moduleController from '../controllers/moduleController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const moduleRoutes = Router();

moduleRoutes.use(requireAuth);

moduleRoutes.get('/', moduleController.listModules);
moduleRoutes.post('/', moduleController.createModule);
moduleRoutes.post('/publish', moduleController.publishModule);
moduleRoutes.get('/:id', moduleController.getModule);
moduleRoutes.put('/:id', moduleController.updateModule);
moduleRoutes.post('/:id/publish', moduleController.publishModule);
moduleRoutes.delete('/:id', moduleController.deleteModule);

export default moduleRoutes;
