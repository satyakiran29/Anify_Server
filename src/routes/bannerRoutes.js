import express from 'express';
import { bannerController } from '../controllers/bannerController.js';
import { upload } from '../middleware/upload.js';
import { requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Public fetch routes
router.get('/', bannerController.getBanners);
router.get('/:id', bannerController.getBannerById);

// Admin-secured modification routes
router.post('/', requireAdmin, upload.single('image'), bannerController.createBanner);
router.put('/:id', requireAdmin, upload.single('image'), bannerController.updateBanner);
router.delete('/:id', requireAdmin, bannerController.deleteBanner);

export default router;
