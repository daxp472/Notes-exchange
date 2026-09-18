import express from 'express';
import { body } from 'express-validator';
import {
  getUserPreferences,
  updateUserPreferences,
  getAppStats
} from '../controllers/adminController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// User preferences routes
router.get('/preferences', authenticateToken, getUserPreferences);

const preferencesValidation = [
  body('darkMode')
    .optional()
    .isBoolean()
    .withMessage('Dark mode must be a boolean'),
  body('emailNotifications')
    .optional()
    .isBoolean()
    .withMessage('Email notifications must be a boolean'),
  body('pushNotifications')
    .optional()
    .isBoolean()
    .withMessage('Push notifications must be a boolean')
];

router.patch('/preferences', authenticateToken, preferencesValidation, updateUserPreferences);

// Admin stats route (add admin middleware later if needed)
router.get('/stats', authenticateToken, getAppStats);

export default router;