import path from 'path';
import fs from 'fs';
import TesseractOCR from '../services/ocr/TesseractOCR.js';
import Exam from '../models/Exam.js';
import Question from '../models/Question.js';

// Resolve OCR Provider dynamically
const getOCRProvider = async () => {
  const isGeminiConfigured = process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY !== 'your_gemini_api_key_here';
  
  if (isGeminiConfigured) {
    try {
      // Import primary Gemini Vision OCR provider (from Phase 5 folder)
      const { default: GeminiVisionOCR } = await import('../services/ocr/GeminiVisionOCR.js');
      console.log('[OCRController] Initializing primary Gemini Vision OCR engine.');
      return new GeminiVisionOCR();
    } catch (err) {
      console.warn('[OCRController] Failed to load GeminiVisionOCR. Defaulting to local Tesseract fallback:', err.message);
    }
  }
  
  console.log('[OCRController] Initializing fallback TesseractOCR local engine.');
  return new TesseractOCR();
};

// @desc    Process uploaded document, run OCR, and extract questions
// @route   POST /api/ocr/upload
// @access  Private/Admin
export const processOcrDocument = async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ message: 'No examination document file uploaded.' });
  }

  const filePath = req.file.path;
  console.log(`[OCRController] Received document for parsing: ${req.file.originalname}`);

  try {
    const provider = await getOCRProvider();
    
    // Execute structural extraction
    const result = await provider.extractQuestions(filePath);

    // Proactively delete processed file to conserve space
    fs.unlink(filePath, (err) => {
      if (err) console.error('[OCRController] Local file cleanup failed:', err.message);
    });

    res.json({
      message: 'OCR document extraction completed successfully.',
      rawText: result.rawText,
      parsedQuestions: result.parsedQuestions,
    });
  } catch (error) {
    console.error('[OCRController] Extraction failed:', error);
    
    // Fallback: If primary (Gemini) failed, attempt local TesseractOCR explicitly
    try {
      console.log('[OCRController] Attempting emergency TesseractOCR fallback processing.');
      const fallbackProvider = new TesseractOCR();
      const fallbackResult = await fallbackProvider.extractQuestions(filePath);

      // Clean file
      fs.unlink(filePath, (err) => {
        if (err) console.error('[OCRController] Cleanup failed:', err.message);
      });

      return res.json({
        message: 'Extraction succeeded via local fallback.',
        rawText: fallbackResult.rawText,
        parsedQuestions: fallbackResult.parsedQuestions,
      });
    } catch (fallbackError) {
      // Cleanup on absolute failure
      fs.unlink(filePath, () => {});
      res.status(500).json({
        message: 'Document parsing failed entirely on both engines.',
        error: error.message,
        fallbackError: fallbackError.message
      });
    }
  }
};

// @desc    Finalize questions and save exam configuration
// @route   POST /api/ocr/finalize
// @access  Private/Admin
export const finalizeOcrExam = async (req, res) => {
  const { title, subject, duration, totalMarks, questions } = req.body;

  if (!questions || questions.length === 0) {
    return res.status(400).json({ message: 'Cannot save exam without questions.' });
  }

  try {
    console.log(`[OCRController] finalization request: ${title} with ${questions.length} questions.`);
    const savedQuestionIds = [];

    // Create and save each question document
    for (let i = 0; i < questions.length; i++) {
      const q = questions[i];
      
      // Parse answers array (ensure string array or number array parsed cleanly)
      let parsedCorrectAnswer = [];
      if (Array.isArray(q.correctAnswer)) {
        parsedCorrectAnswer = q.correctAnswer;
      } else {
        // If single integer/string key passed
        const val = q.correctAnswer;
        if (val !== undefined && val !== null && val !== '') {
          // If option index represents a number
          const num = parseInt(val);
          parsedCorrectAnswer = isNaN(num) ? [val] : [num];
        } else {
          parsedCorrectAnswer = [0];
        }
      }

      const questionObj = await Question.create({
        questionNumber: q.questionNumber || (i + 1),
        subject: q.subject || subject || 'General',
        type: q.type || 'single',
        question: q.question,
        options: q.options || [],
        correctAnswer: parsedCorrectAnswer,
        imageUrl: q.imageUrl || '',
        solution: q.solution || '',
        difficulty: q.difficulty || 'medium',
        chapter: q.chapter || '',
        topic: q.topic || '',
      });
      
      savedQuestionIds.push(questionObj._id);
    }

    // Create Exam object
    const exam = await Exam.create({
      title,
      subject,
      duration: duration || 180,
      totalMarks: totalMarks || (questions.length * 4),
      totalQuestions: questions.length,
      questions: savedQuestionIds,
      description: `Structured computer-based test replica created via automated AI-OCR engine pipelines.`,
      instructions: [
        `The examination is of ${duration || 180} minutes duration.`,
        `The test has ${questions.length} questions.`,
        'For each correct response, +4 marks will be added.',
        'Negative marking is enabled for incorrect single choices.',
      ]
    });

    res.status(201).json(exam);
  } catch (error) {
    console.error('[OCRController] Finalization failed:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Generate detailed step-by-step solution explain via Gemini LLM
// @route   POST /api/ocr/questions/:questionId/explain
// @access  Private
export const explainQuestionSolution = async (req, res) => {
  const { questionId } = req.params;

  try {
    const question = await Question.findById(questionId);
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    // Initialize Gemini Provider
    const GeminiProvider = (await import('../services/ai/GeminiProvider.js')).default;
    const aiProvider = new GeminiProvider();

    const explanation = await aiProvider.explainSolution(
      question.question,
      question.options || [],
      question.correctAnswer
    );

    res.json({ explanation });
  } catch (error) {
    console.error('[OCRController] AI Explanation failed:', error);
    res.status(500).json({ message: error.message });
  }
};

// @desc    Generate a structurally similar question via Gemini LLM
// @route   POST /api/ocr/questions/:questionId/similar
// @access  Private/Admin
export const generateSimilarQuestion = async (req, res) => {
  const { questionId } = req.params;

  try {
    const question = await Question.findById(questionId);
    if (!question) {
      return res.status(404).json({ message: 'Question not found' });
    }

    const GeminiProvider = (await import('../services/ai/GeminiProvider.js')).default;
    const aiProvider = new GeminiProvider();

    const prompt = `
      You are an expert exam editor.
      Generate a structurally similar but different question based on the following reference question.
      Preserve the difficulty, subject matter, and format (LaTeX mathematical formulas).
      
      Reference Question:
      Question Body: ${question.question}
      Options: ${JSON.stringify(question.options)}
      Correct Option Index: ${question.correctAnswer}
      
      Return the output as a valid JSON object matching the following structure (no markdown wrappers):
      {
        "questionNumber": ${question.questionNumber},
        "subject": "${question.subject}",
        "type": "${question.type}",
        "question": "New generated question text here...",
        "options": [
          "New option A",
          "New option B",
          "New option C",
          "New option D"
        ],
        "correctAnswer": [0],
        "solution": "Step-by-step LaTeX solution explanation...",
        "difficulty": "${question.difficulty}",
        "chapter": "${question.chapter}",
        "topic": "${question.topic}"
      }
    `;

    const model = aiProvider.genAI.getGenerativeModel({
      model: aiProvider.modelName,
      generationConfig: { responseMimeType: 'application/json' },
    });

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    const parsedQuestion = JSON.parse(text);

    // Save the new question to the database
    const savedQuestion = await Question.create(parsedQuestion);

    res.json(savedQuestion);
  } catch (error) {
    console.error('[OCRController] Generate similar question failed:', error);
    res.status(500).json({ message: error.message });
  }
};

