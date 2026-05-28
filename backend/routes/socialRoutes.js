import express from 'express';
import { socialController } from '../controllers/socialController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// User Follow/Unfollow Routes
router.post('/follow/:userId', authenticateToken, socialController.followUser);
router.delete('/unfollow/:userId', authenticateToken, socialController.unfollowUser);
router.get('/followers/:userId', authenticateToken, socialController.getFollowers);
router.get('/following/:userId', authenticateToken, socialController.getFollowing);
router.get('/follow-status/:userId', authenticateToken, socialController.getFollowStatus);

// Study Groups Routes
router.post('/study-groups', authenticateToken, socialController.createStudyGroup);
router.get('/study-groups', authenticateToken, socialController.getStudyGroups);
router.get('/study-groups/:groupId', authenticateToken, socialController.getStudyGroup);
router.put('/study-groups/:groupId', authenticateToken, socialController.updateStudyGroup);
router.delete('/study-groups/:groupId', authenticateToken, socialController.deleteStudyGroup);
router.post('/study-groups/:groupId/join', authenticateToken, socialController.joinStudyGroup);
router.delete('/study-groups/:groupId/leave', authenticateToken, socialController.leaveStudyGroup);
router.post('/study-groups/:groupId/notes/:noteId', authenticateToken, socialController.addNoteToGroup);
router.delete('/study-groups/:groupId/notes/:noteId', authenticateToken, socialController.removeNoteFromGroup);

// Note Bookmarking Routes
router.post('/bookmarks/:noteId', authenticateToken, socialController.bookmarkNote);
router.delete('/bookmarks/:noteId', authenticateToken, socialController.removeBookmark);
router.get('/bookmarks', authenticateToken, socialController.getUserBookmarks);

// User Profile Social Stats
router.get('/profile-stats/:userId', authenticateToken, socialController.getProfileStats);

export default router;