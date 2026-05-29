import express from 'express';
import { wallpaperController } from '../controllers/wallpaperController.js';
import { upload } from '../middleware/upload.js';
import { requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Fetch routes
router.get('/', wallpaperController.getWallpapers);
router.get('/random', wallpaperController.getRandomWallpaper);
router.get('/categories', wallpaperController.getCategories);
router.get('/stats', wallpaperController.getStats);
router.get('/:id', wallpaperController.getWallpaperById);

// Auth login route
router.post('/auth/login', wallpaperController.loginAdmin);

// Write/Modify routes (secured with requireAdmin)
router.post('/', requireAdmin, upload.single('image'), wallpaperController.createWallpaper);
router.put('/:id', requireAdmin, upload.single('image'), wallpaperController.updateWallpaper);
router.delete('/:id', requireAdmin, wallpaperController.deleteWallpaper);

export default router;
