import express from 'express';
import { studyScheduleController } from '../controllers/studyScheduleController.js';
import { authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// Exam Schedule Routes
router.get('/exams', authenticateToken, studyScheduleController.getExams);
router.post('/exams', authenticateToken, studyScheduleController.createExam);
router.put('/exams/:examId', authenticateToken, studyScheduleController.updateExam);
router.delete('/exams/:examId', authenticateToken, studyScheduleController.deleteExam);

// Study Schedule Routes
router.get('/upcoming', authenticateToken, studyScheduleController.getUpcomingExams);
router.get('/suggested-notes/:examId', authenticateToken, studyScheduleController.getSuggestedNotes);
router.get('/study-plan/:examId', authenticateToken, studyScheduleController.getStudyPlan);

export default router;