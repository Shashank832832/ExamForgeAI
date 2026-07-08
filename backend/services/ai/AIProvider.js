/**
 * @interface AIProvider
 * Abstract Base Class for LLM API Integration Providers
 */
export default class AIProvider {
  constructor(name) {
    this.name = name;
  }

  /**
   * Generate basic text completion
   * @param {string} prompt - Input prompt
   * @param {object} [options] - Optional configurations
   * @returns {Promise<string>} Text completion
   */
  async generateCompletion(prompt, options = {}) {
    throw new Error(`Method 'generateCompletion' must be implemented by ${this.constructor.name}`);
  }

  /**
   * Structure raw OCR text into structured examination JSON schema
   * @param {string} rawText - Unstructured text from local OCR
   * @param {string} [subjectHint] - Optional subject hint (e.g. Physics)
   * @returns {Promise<object>} Structured JSON object containing questions array
   */
  async structureQuestions(rawText, subjectHint = '') {
    throw new Error(`Method 'structureQuestions' must be implemented by ${this.constructor.name}`);
  }

  /**
   * Generate a step-by-step solution for a question
   * @param {string} questionText - Question body
   * @param {Array} options - Options list
   * @param {string} correctKey - Correct answer key
   * @returns {Promise<string>} Step-by-step LaTeX solution
   */
  async explainSolution(questionText, options, correctKey) {
    throw new Error(`Method 'explainSolution' must be implemented by ${this.constructor.name}`);
  }
}
