import express from 'express';
import { collaborationController } from '../controllers/collaborationController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Comments Routes
router.get('/comments/:noteId', collaborationController.getComments);
router.post('/comments/:noteId', authenticateToken, collaborationController.addComment);
router.put('/comments/:commentId', authenticateToken, collaborationController.updateComment);
router.delete('/comments/:commentId', authenticateToken, collaborationController.deleteComment);

// Ratings and Reviews Routes
router.get('/ratings/:noteId', collaborationController.getRatings);
router.post('/ratings/:noteId', authenticateToken, collaborationController.addRating);
router.put('/ratings/:ratingId', authenticateToken, collaborationController.updateRating);
router.delete('/ratings/:ratingId', authenticateToken, collaborationController.deleteRating);

// Version Control Routes
router.get('/versions/:noteId', collaborationController.getVersions);
router.post('/versions/:noteId', authenticateToken, collaborationController.uploadVersion);
router.get('/versions/:noteId/:versionId/download', collaborationController.downloadVersion);
router.delete('/versions/:versionId', authenticateToken, collaborationController.deleteVersion);

export default router;