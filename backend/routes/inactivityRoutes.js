import express from 'express';
import { authenticateToken } from '../middleware/auth.js';
import {
  deactivateInactiveUsers,
  keepAccountAlive,
  reactivateAccount,
  getInactivityStatus
} from '../controllers/inactivityController.js';

const router = express.Router();

// Admin endpoint - deactivate inactive users (run via scheduler)
router.post('/deactivate-inactive', deactivateInactiveUsers);

// User endpoint - keep account alive (call every 7 days or on login)
router.post('/keep-alive', authenticateToken, keepAccountAlive);

// User endpoint - reactivate deactivated account
router.post('/reactivate', authenticateToken, reactivateAccount);

// User endpoint - get own inactivity status
router.get('/status', authenticateToken, getInactivityStatus);

export default router;
