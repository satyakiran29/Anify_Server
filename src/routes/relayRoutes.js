import express from 'express';
import { relayController } from '../controllers/relayController.js';

const router = express.Router();

router.get('/stats', relayController.getStats);
router.get('/health', relayController.getHealth);

export default router;
