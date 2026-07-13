import { Router } from 'express';
import * as searchController from '../controllers/searchController.js';

const searchRoutes = Router();

searchRoutes.get('/', searchController.search);

export default searchRoutes;
