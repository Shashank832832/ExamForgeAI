import fs from 'fs';
import path from 'path';
import { GoogleGenerativeAI } from '@google/generative-ai';
import OCRProvider from './OCRProvider.js';
import dotenv from 'dotenv';

dotenv.config();

export default class GeminiVisionOCR extends OCRProvider {
  constructor() {
    super('GeminiVisionOCR');
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY is not defined.');
    }
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.modelName = process.env.GEMINI_MODEL || 'gemini-2.5-pro';
  }

  // Convert local file to base64 inlineData object for Gemini SDK
  fileToGenerativePart(filePath) {
    const fileBuffer = fs.readFileSync(filePath);
    const ext = path.extname(filePath).toLowerCase();
    
    let mimeType = 'application/pdf';
    if (ext === '.png') mimeType = 'image/png';
    else if (['.jpg', '.jpeg'].includes(ext)) mimeType = 'image/jpeg';
    else if (ext === '.webp') mimeType = 'image/webp';

    return {
      inlineData: {
        data: Buffer.from(fileBuffer).toString('base64'),
        mimeType,
      },
    };
  }

  /**
   * Extract raw text from file using Gemini multimodal model
   */
  async extractText(filePath) {
    console.log(`[GeminiVisionOCR] Extracting raw text from document using Gemini...`);
    const model = this.genAI.getGenerativeModel({ model: this.modelName });
    const filePart = this.fileToGenerativePart(filePath);

    const prompt = 'Please extract all the text and content from this document exactly as it is, maintaining formatting where possible.';
    
    const result = await model.generateContent([filePart, prompt]);
    return result.response.text();
  }

  /**
   * Directly extract structured questions from PDF/Image using Gemini Vision multimodal parsing
   */
  async extractQuestions(filePath) {
    console.log(`[GeminiVisionOCR] Extracting structured questions directly from document stream using Gemini Vision...`);
    const model = this.genAI.getGenerativeModel({
      model: this.modelName,
      generationConfig: {
        responseMimeType: 'application/json',
      },
    });

    const filePart = this.fileToGenerativePart(filePath);
    const prompt = `
      You are an expert examination paper parser.
      Analyze the attached exam document (PDF or Image) and extract all questions, mathematical expressions, options, and layouts.
      
      INSTRUCTIONS:
      1. Extract every question, question number, subject, and option.
      2. If you see equations, mathematical formulas, or inline mathematical variables, ALWAYS format them as valid LaTeX (e.g., wrap inline formulas in single dollar signs like $y = mx + c$ and block equations in double dollar signs like $$\\sum_{i=1}^n i = \\frac{n(n+1)}{2}$$). Double-escape all backslashes inside JSON strings (e.g., use \\\\int and \\\\frac).
      3. For multiple-choice questions (MCQs), the 'options' field must be an array of exactly 4 strings.
      4. Detect the correctAnswer. Set 'correctAnswer' as an array of 0-based option indexes (e.g., [0] for A, [1] for B) or text values for numerical inputs (e.g. ["12.5"]).
      5. Identify the question type: "single" (single correct MCQ), "multiple" (multiple correct MCQs), or "numerical" (numerical decimal value fill-in).
      6. Provide a detailed step-by-step textbook solution in LaTeX for the 'solution' field.
      7. Classify the question's 'subject' (Physics, Chemistry, or Mathematics), 'difficulty' (easy, medium, hard), 'chapter', and 'topic'.
      
      Expected JSON Format (Return ONLY the JSON matching this schema, no markdown wrappers):
      {
        "rawText": "Provide a complete extracted text log of the exam here...",
        "parsedQuestions": [
          {
            "questionNumber": 1,
            "subject": "Physics",
            "type": "single",
            "question": "A particle moves along...",
            "options": [
              "Option A text",
              "Option B text",
              "Option C text",
              "Option D text"
            ],
            "correctAnswer": [0],
            "solution": "Detailed LaTeX explanation...",
            "difficulty": "medium",
            "chapter": "Kinematics",
            "topic": "Projectile Motion"
          }
        ]
      }
    `;

    const result = await model.generateContent([filePart, prompt]);
    const text = result.response.text();
    
    try {
      return JSON.parse(text);
    } catch (err) {
      console.error('[GeminiVisionOCR] JSON parse failure. Raw output:', text);
      throw new Error(`Failed to parse structured JSON from Gemini Vision API: ${err.message}`);
    }
  }
}
