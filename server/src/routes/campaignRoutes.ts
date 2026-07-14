import { Router } from 'express';
import * as campaignController from '../controllers/campaignController.js';
import { requireAuth } from '../middleware/authMiddleware.js';

const campaignRoutes = Router();

campaignRoutes.use(requireAuth);
campaignRoutes.get('/', campaignController.listCampaigns);
campaignRoutes.post('/', campaignController.createCampaign);
campaignRoutes.get('/:id', campaignController.getCampaign);
campaignRoutes.put('/:id', campaignController.updateCampaign);
campaignRoutes.delete('/:id', campaignController.deleteCampaign);

export default campaignRoutes;
