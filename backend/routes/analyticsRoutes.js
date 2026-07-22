import express from 'express';
import { analyticsController } from '../controllers/analyticsController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Analytics Dashboard Routes
router.get('/platform-stats', analyticsController.getPlatformStats);
router.get('/dashboard', authenticateToken, analyticsController.getDashboardStats);
router.get('/study-streaks/:userId', authenticateToken, analyticsController.getStudyStreaks);
router.get('/trending-notes', authenticateToken, analyticsController.getTrendingNotes);
router.get('/leaderboard', authenticateToken, analyticsController.getContributionLeaderboard);
router.get('/weekly-activity/:userId', authenticateToken, analyticsController.getWeeklyActivity);
router.get('/monthly-stats/:userId', authenticateToken, analyticsController.getMonthlyStats);

export default router;