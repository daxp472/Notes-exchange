import express from 'express';
import { notificationsEnhancedController } from '../controllers/notificationsEnhancedController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Enhanced Notifications Routes
router.get('/', authenticateToken, notificationsEnhancedController.getNotifications);
router.put('/:id/read', authenticateToken, notificationsEnhancedController.markAsRead);
router.put('/read-all', authenticateToken, notificationsEnhancedController.markAllAsRead);
router.delete('/:id', authenticateToken, notificationsEnhancedController.deleteNotification);
router.get('/unread-count', authenticateToken, notificationsEnhancedController.getUnreadCount);
router.post('/subscribe', authenticateToken, notificationsEnhancedController.subscribeToSubject);
router.delete('/unsubscribe/:subject', authenticateToken, notificationsEnhancedController.unsubscribeFromSubject);
router.get('/preferences', authenticateToken, notificationsEnhancedController.getNotificationPreferences);
router.put('/preferences', authenticateToken, notificationsEnhancedController.updateNotificationPreferences);

export default router;