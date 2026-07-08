import express from 'express';
import { getExams, getExamById, submitExamAttempt, getResultById } from '../controllers/examController.js';
import { getCandidateDashboardStats } from '../controllers/adminController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

// Student portal dashboard analytics
router.get('/dashboard/stats', protect, getCandidateDashboardStats);

// Mock exams list
router.get('/exams', protect, getExams);

// Mock exam details with questions
router.get('/exams/:id', protect, getExamById);

// Submit Mock responses
router.post('/exams/:id/submit', protect, submitExamAttempt);

// Get attempt results scorecard
router.get('/results/:attemptId', protect, getResultById);

export default router;
