import express from 'express';
import { body } from 'express-validator';
import {
  getNotes,
  getNoteById,
  uploadNote,
  downloadNote,
  deleteNote,
  rateNote,
  getNoteRatings,
  addComment,
  getNoteComments,
  addFavorite,
  removeFavorite,
  getFavorites,
  getUserNotes,
  getRecommendations,
  getSeasonalTrends,
} from '../controllers/notesController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Validation rules
const uploadValidation = [
  body('title')
    .trim()
    .isLength({ min: 3, max: 200 })
    .withMessage('Title must be between 3 and 200 characters'),
  body('description')
    .trim()
    .isLength({ min: 5, max: 1000 })
    .withMessage('Description must be between 5 and 1000 characters'),
  body('subject')
    .trim()
    .notEmpty()
    .withMessage('Subject is required'),
  body('semester')
    .isInt({ min: 1, max: 12 })
    .withMessage('Semester must be between 1 and 12'),
  body('course')
    .trim()
    .notEmpty()
    .withMessage('Course is required'),
];

const ratingValidation = [
  body('rating')
    .isInt({ min: 1, max: 5 })
    .withMessage('Rating must be between 1 and 5'),
  body('comment')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Comment must be less than 500 characters'),
];

const commentValidation = [
  body('comment')
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage('Comment must be between 1 and 1000 characters'),
];

// Public discovery & specialized routes (must precede :id)
router.get('/', getNotes);
router.get('/recommendations', getRecommendations);
router.get('/trends/seasonal', getSeasonalTrends);
router.get('/user/favorites', authenticateToken, getFavorites);
router.get('/user/:userId', getUserNotes);

// Single note item routes
router.get('/:id', getNoteById);
router.get('/:id/download', downloadNote);
router.get('/:id/ratings', getNoteRatings);
router.get('/:id/comments', getNoteComments);

// Protected routes
router.post('/', authenticateToken, uploadValidation, uploadNote);
router.delete('/:id', authenticateToken, deleteNote);
router.post('/:id/rate', authenticateToken, ratingValidation, rateNote);
router.post('/:id/comments', authenticateToken, commentValidation, addComment);
router.post('/:id/favorite', authenticateToken, addFavorite);
router.delete('/:id/favorite', authenticateToken, removeFavorite);

export default router;