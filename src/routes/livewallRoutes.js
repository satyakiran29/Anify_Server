import express from 'express';
import { livewallController } from '../controllers/livewallController.js';
import { uploadLive } from '../middleware/uploadLive.js';
import { requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Fetch routes (public)
router.get('/', livewallController.getLivewalls);
router.get('/random', livewallController.getRandomLivewall);
router.get('/categories', livewallController.getCategories);
router.get('/stats', livewallController.getStats);
router.get('/:id', livewallController.getLivewallById);

// Write/Modify routes (secured with requireAdmin)
// Supports uploading video file (as 'video') and optional preview image (as 'thumbnail')
router.post(
  '/',
  requireAdmin,
  uploadLive.fields([
    { name: 'video', maxCount: 1 },
    { name: 'thumbnail', maxCount: 1 }
  ]),
  livewallController.createLivewall
);

router.put(
  '/:id',
  requireAdmin,
  uploadLive.fields([
    { name: 'video', maxCount: 1 },
    { name: 'thumbnail', maxCount: 1 }
  ]),
  livewallController.updateLivewall
);

router.delete('/:id', requireAdmin, livewallController.deleteLivewall);

export default router;
