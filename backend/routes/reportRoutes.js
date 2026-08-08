import express from 'express';
import { body } from 'express-validator';
import {
  createReport,
  getAllReports,
  updateReportStatus,
  getReportStats
} from '../controllers/reportController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Validation rules
const reportValidation = [
  body('contentType')
    .isIn(['note', 'comment', 'user'])
    .withMessage('Content type must be note, comment, or user'),
  body('contentId')
    .notEmpty()
    .withMessage('Content ID is required'),
  body('reason')
    .trim()
    .isLength({ min: 3, max: 100 })
    .withMessage('Reason must be between 3 and 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description must be less than 500 characters')
];

const statusValidation = [
  body('status')
    .isIn(['pending', 'reviewed', 'resolved'])
    .withMessage('Status must be pending, reviewed, or resolved')
];

// Create a report (authenticated users)
router.post('/', authenticateToken, reportValidation, createReport);

// Admin routes (require authentication - you can add admin check middleware later)
router.get('/', authenticateToken, getAllReports);
router.patch('/:reportId/status', authenticateToken, statusValidation, updateReportStatus);
router.get('/stats', authenticateToken, getReportStats);

export default router;