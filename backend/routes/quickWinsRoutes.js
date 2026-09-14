import express from 'express';
import { quickWinsController } from '../controllers/quickWinsController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Recently Viewed Routes
router.get('/recently-viewed', authenticateToken, quickWinsController.getRecentlyViewed);
router.post('/recently-viewed/:noteId', authenticateToken, quickWinsController.addToRecentlyViewed);

// Search History Routes
router.get('/search-history', authenticateToken, quickWinsController.getSearchHistory);
router.post('/search-history', authenticateToken, quickWinsController.addSearchHistory);
router.delete('/search-history/:id', authenticateToken, quickWinsController.deleteSearchHistory);
router.delete('/search-history', authenticateToken, quickWinsController.clearSearchHistory);

// Bulk Download Routes
router.post('/bulk-download', authenticateToken, quickWinsController.createBulkDownload);
router.get('/bulk-download/:downloadId', authenticateToken, quickWinsController.getBulkDownload);

// Enhanced User Profile Routes
router.get('/user-profile/:userId', quickWinsController.getEnhancedUserProfile);
router.get('/user-activity/:userId', authenticateToken, quickWinsController.getUserActivity);

export default router;