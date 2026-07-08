import { GoogleGenerativeAI } from '@google/generative-ai';
import AIProvider from './AIProvider.js';
import dotenv from 'dotenv';

dotenv.config();

export default class GeminiProvider extends AIProvider {
  constructor() {
    super('GeminiProvider');
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is not defined.');
    }
    this.genAI = new GoogleGenerativeAI(apiKey);
    this.modelName = process.env.GEMINI_MODEL || 'gemini-2.5-pro';
  }

  /**
   * Basic completion generator
   * @param {string} prompt - Prompt instruction
   * @returns {Promise<string>} text response
   */
  async generateCompletion(prompt) {
    console.log(`[GeminiProvider] Generating completion using model: ${this.modelName}`);
    const model = this.genAI.getGenerativeModel({ model: this.modelName });
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  }

  /**
   * Structure raw OCR text into structured examination JSON schema
   * @param {string} rawText - Unstructured text from local OCR
   * @param {string} [subjectHint] - Subject area (Physics, Chemistry, Maths)
   * @returns {Promise<object>} Structured JSON object
   */
  async structureQuestions(rawText, subjectHint = '') {
    console.log(`[GeminiProvider] Cleaning raw OCR text layouts and structuring into JSON format...`);
    const model = this.genAI.getGenerativeModel({
      model: this.modelName,
      generationConfig: {
        responseMimeType: 'application/json',
      },
    });

    const prompt = `
      You are an expert examination paper parser.
      Convert the following raw OCR text extracted from an exam PDF into a structured JSON array of question objects.
      
      CRITICAL INSTRUCTIONS:
      1. Extract every question, option, question number, and section information.
      2. If you see equations or mathematical formulas, ALWAYS format them as valid LaTeX (e.g., wrap inline formulas in single dollar signs like $E = mc^2$ and block formulas in double dollar signs like $$f(x) = \\int_{-\\infty}^\\infty e^{-x^2} dx$$). Double-escape all backslashes inside JSON strings (e.g., use \\\\int and \\\\frac).
      3. For multiple-choice questions (MCQs), the 'options' field must be an array of exactly 4 strings.
      4. Detect the correctAnswer. Set 'correctAnswer' as an array of 0-based option indexes (e.g., [0] for A, [1] for B) or text values for numerical inputs (e.g. ["12.5"]).
      5. Identify the question type: "single" (single correct MCQ), "multiple" (multiple correct MCQs), or "numerical" (numerical decimal value fill-in).
      6. Provide a detailed step-by-step textbook solution in LaTeX for the 'solution' field.
      7. Classify the question's 'subject' (Physics, Chemistry, or Mathematics), 'difficulty' (easy, medium, hard), 'chapter', and 'topic'.
      
      Raw OCR Text:
      ---
      ${rawText}
      ---
      Subject Stream Hint: ${subjectHint || 'Detect from context'}
      
      Expected JSON Format (Return ONLY the JSON matching this schema, no markdown wrappers):
      {
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

    const result = await model.generateContent(prompt);
    const text = result.response.text();
    
    try {
      // Parse the JSON result directly
      return JSON.parse(text);
    } catch (err) {
      console.error('[GeminiProvider] JSON parse failure. Raw output:', text);
      throw new Error(`Failed to parse structured JSON from LLM: ${err.message}`);
    }
  }

  /**
   * Generate detailed step-by-step LaTeX solution explanation
   */
  async explainSolution(questionText, options, correctKey) {
    console.log(`[GeminiProvider] Requesting AI step explanation...`);
    const model = this.genAI.getGenerativeModel({ model: this.modelName });

    const prompt = `
      You are an expert tutor. Provide a detailed, step-by-step academic explanation and solution for the following question.
      Format all mathematical expressions, equations, chemical symbols, and structures in standard LaTeX format using $...$ for inline math and $$...$$ for block formulas.
      
      Question:
      ${questionText}
      
      Options:
      ${options.map((opt, i) => `${String.fromCharCode(65 + i)}: ${opt}`).join('\n')}
      
      Correct Key Option: Option Index ${correctKey} (0=A, 1=B, 2=C, 3=D)
      
      Please write a clear, pedagogical proof and explanation showing how to arrive at the correct answer.
    `;

    const result = await model.generateContent(prompt);
    return result.response.text();
  }
}
