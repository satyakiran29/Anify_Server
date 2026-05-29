import express from 'express';
import { ringtoneController } from '../controllers/ringtoneController.js';
import { uploadRingtone } from '../middleware/uploadRingtone.js';
import { requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Fetch routes (public)
router.get('/', ringtoneController.getRingtones);
router.get('/random', ringtoneController.getRandomRingtone);
router.get('/stats', ringtoneController.getStats);
router.get('/:id', ringtoneController.getRingtoneById);

// Write/Modify routes (secured with requireAdmin)
// Supports uploading audio file (as 'audio')
router.post('/', requireAdmin, uploadRingtone.array('audio', 50), ringtoneController.createRingtone);
router.put('/:id', requireAdmin, uploadRingtone.single('audio'), ringtoneController.updateRingtone);
router.delete('/:id', requireAdmin, ringtoneController.deleteRingtone);

export default router;
