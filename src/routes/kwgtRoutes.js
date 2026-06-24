import express from 'express';
import { kwgtController } from '../controllers/kwgtController.js';
import { uploadKwgt } from '../middleware/uploadKwgt.js';
import { requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Fetch routes
router.get('/', kwgtController.getKwgts);
router.get('/random', kwgtController.getRandomKwgt);
router.get('/categories', kwgtController.getCategories);
router.get('/stats', kwgtController.getStats);
router.get('/:id', kwgtController.getKwgtById);

// Write/Modify routes (secured with requireAdmin)
router.post(
  '/',
  requireAdmin,
  uploadKwgt.fields([
    { name: 'file', maxCount: 50 },
    { name: 'thumbnail', maxCount: 1 }
  ]),
  kwgtController.createKwgt
);
router.put(
  '/:id',
  requireAdmin,
  uploadKwgt.fields([
    { name: 'file', maxCount: 1 },
    { name: 'thumbnail', maxCount: 1 }
  ]),
  kwgtController.updateKwgt
);
router.delete('/:id', requireAdmin, kwgtController.deleteKwgt);

export default router;
