import express from 'express';
import { stickerController } from '../controllers/stickerController.js';
import { requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Public routes
router.get('/', stickerController.getStickers);
router.get('/random', stickerController.getRandomStickers);
router.get('/categories', stickerController.getCategories);
router.get('/stats', stickerController.getStats);
router.get('/:id', stickerController.getStickerById);

// Auto-fetch metadata from Telegram (public or admin)
router.post('/auto-fetch', stickerController.autoFetchTelegram);

// Admin-secured CRUD routes
router.post('/', requireAdmin, stickerController.createStickerPack);
router.put('/:id', requireAdmin, stickerController.updateStickerPack);
router.delete('/:id', requireAdmin, stickerController.deleteStickerPack);

export default router;
