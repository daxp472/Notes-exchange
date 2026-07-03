import express from 'express';
import { body } from 'express-validator';
import {
  getPrivateMessages,
  sendPrivateMessage,
  getChatContacts,
  searchUsers,
  createGroup,
  getUserGroups,
  getGroupMessages,
  sendGroupMessage,
  addGroupMember,
  removeGroupMember,
  getGroupMembers,
  leaveGroup,
  updateGroup,
  deleteGroup,
} from '../controllers/chatController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Validation rules
const messageValidation = [
  body('content')
    .trim()
    .isLength({ min: 1, max: 1000 })
    .withMessage('Message must be between 1 and 1000 characters'),
];

const groupValidation = [
  body('name')
    .trim()
    .isLength({ min: 1, max: 100 })
    .withMessage('Group name must be between 1 and 100 characters'),
  body('description')
    .optional()
    .trim()
    .isLength({ max: 500 })
    .withMessage('Description must be less than 500 characters'),
];

const addMemberValidation = [
  body('userId')
    .notEmpty()
    .withMessage('User ID is required')
    .isUUID()
    .withMessage('User ID must be a valid UUID'),
];

// ===================
// PRIVATE CHAT ROUTES
// ===================

// Get chat contacts (users who have exchanged messages with current user)
router.get('/contacts', authenticateToken, getChatContacts);

// Search users by name
router.get('/search-users', authenticateToken, searchUsers);

// Get private messages with a specific user
router.get('/private/:userId', authenticateToken, getPrivateMessages);

// Send private message to a user
router.post('/private/:userId', authenticateToken, messageValidation, sendPrivateMessage);

// ================
// GROUP CHAT ROUTES
// ================

// Create a new group
router.post('/groups', authenticateToken, groupValidation, createGroup);

// Get all groups user is part of
router.get('/groups', authenticateToken, getUserGroups);

// Get messages of a specific group
router.get('/groups/:groupId/messages', authenticateToken, getGroupMessages);

// Send message in group
router.post('/groups/:groupId/messages', authenticateToken, messageValidation, sendGroupMessage);

// Get group members
router.get('/groups/:groupId/members', authenticateToken, getGroupMembers);

// Add member to group
router.post('/groups/:groupId/members', authenticateToken, addMemberValidation, addGroupMember);

// Remove member from group
router.delete('/groups/:groupId/members/:userId', authenticateToken, removeGroupMember);

// Leave group
router.delete('/groups/:groupId/leave', authenticateToken, leaveGroup);

// Update group details
router.patch('/groups/:groupId', authenticateToken, groupValidation, updateGroup);

// Delete group
router.delete('/groups/:groupId', authenticateToken, deleteGroup);

export default router;