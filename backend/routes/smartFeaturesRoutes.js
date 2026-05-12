import express from 'express';
import { smartFeaturesController } from '../controllers/smartFeaturesController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Smart Features Routes
router.post('/check-duplicate', authenticateToken, smartFeaturesController.checkDuplicate);
router.post('/generate-summary', authenticateToken, smartFeaturesController.generateSummary);
router.post('/suggest-category', authenticateToken, smartFeaturesController.suggestCategory);
router.post('/validate-file', authenticateToken, smartFeaturesController.validateFile);
router.get('/auto-tags/:subject', authenticateToken, smartFeaturesController.getAutoTags);

export default router;