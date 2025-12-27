import { Router } from 'express';
import * as settingsController from '../controllers/settings.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { requireAdmin } from '../middleware/rbac.middleware.js';

const router = Router();

// Public route to get watermark settings (for preview)
router.get('/watermark', settingsController.getWatermarkSettings);
router.get('/watermark/preview', settingsController.previewWatermark);

// Admin only routes
router.put('/watermark', authenticate, requireAdmin, settingsController.updateWatermarkSettings);

export default router;
