import express from 'express';
import { pexelsController } from '../controllers/pexelsController.js';

const router = express.Router();

// Fetch routes for Pexels search and curated lists
router.get('/search', pexelsController.searchPhotos);
router.get('/curated', pexelsController.getCuratedPhotos);

export default router;
