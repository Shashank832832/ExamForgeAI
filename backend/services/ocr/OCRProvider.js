/**
 * @interface OCRProvider
 * Abstract Base Class for Document OCR Extraction Providers
 */
export default class OCRProvider {
  constructor(name) {
    this.name = name;
  }

  /**
   * Extract raw text from document file
   * @param {string} filePath - Absolute path to document
   * @returns {Promise<string>} Raw text content
   */
  async extractText(filePath) {
    throw new Error(`Method 'extractText' must be implemented by ${this.constructor.name}`);
  }

  /**
   * Extract structured questions from document file
   * @param {string} filePath - Absolute path to document
   * @returns {Promise<object>} Structured result containing questions array and meta
   */
  async extractQuestions(filePath) {
    throw new Error(`Method 'extractQuestions' must be implemented by ${this.constructor.name}`);
  }
}
