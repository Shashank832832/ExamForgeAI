import express from 'express';
import { 
  processOcrDocument, 
  finalizeOcrExam, 
  explainQuestionSolution, 
  generateSimilarQuestion 
} from '../controllers/ocrController.js';
import upload from '../middleware/upload.js';
import { protect } from '../middleware/auth.js';
import { admin } from '../middleware/admin.js';

const router = express.Router();

// Upload document, run OCR, and extract questions
router.post('/upload', protect, admin, upload.single('file'), processOcrDocument);

// Finalize and save exam into MongoDB
router.post('/finalize', protect, admin, finalizeOcrExam);

// AI Features: Explain solution & Generate similar questions
router.post('/questions/:questionId/explain', protect, explainQuestionSolution);
router.post('/questions/:questionId/similar', protect, admin, generateSimilarQuestion);


export default router;
