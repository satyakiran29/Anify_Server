import express from 'express';
import { wallhavenController } from '../controllers/wallhavenController.js';

const router = express.Router();

// Fetch routes for Wallhaven free mobile wallpapers
router.get('/search', wallhavenController.searchWallpapers);
router.get('/random', wallhavenController.getRandomWallpapers);

export default router;
