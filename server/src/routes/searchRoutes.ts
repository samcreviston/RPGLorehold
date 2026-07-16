import { Router } from 'express';
import * as searchController from '../controllers/searchController.js';

const searchRoutes = Router();

searchRoutes.get('/', searchController.search);
searchRoutes.get('/contents', searchController.searchContents);

export default searchRoutes;
