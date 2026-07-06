const fs = require('fs');
const pdfParse = require('pdf-parse');

/**
 * Extracts raw text from a PDF file on disk.
 * @param {string} filePath - absolute path to the PDF file
 * @returns {Promise<string>} extracted text
 */
const extractTextFromPDF = async (filePath) => {
  const dataBuffer = fs.readFileSync(filePath);
  const data = await pdfParse(dataBuffer);
  return data.text;
};

/**
 * Basic regex-based extraction used as a fast, deterministic fallback
 * (and as a cross-check) alongside the AI-based structured extraction.
 */
const extractBasicFields = (text) => {
  const emailMatch = text.match(/[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/);
  const phoneMatch = text.match(/(\+?\d{1,3}[-.\s]?)?\(?\d{3,5}\)?[-.\s]?\d{3,4}[-.\s]?\d{3,4}/);

  return {
    email: emailMatch ? emailMatch[0] : '',
    phone: phoneMatch ? phoneMatch[0].trim() : '',
  };
};

module.exports = { extractTextFromPDF, extractBasicFields };
