const { GoogleGenerativeAI } = require('@google/generative-ai');

/**
 * AI Service - abstracts away the specific AI provider (Gemini or OpenAI).
 * All prompts request STRICT JSON output so the rest of the app can
 * reliably parse structured data.
 */

const AI_PROVIDER = process.env.AI_PROVIDER || 'gemini';

const genAI = process.env.GEMINI_API_KEY ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY) : null;

const SYSTEM_INSTRUCTIONS = `You are an expert ATS (Applicant Tracking System) engine and professional resume reviewer
with 15+ years of technical recruiting experience. You always respond with STRICT, VALID JSON ONLY.
Never include markdown code fences, explanations, or any text outside the JSON object.`;

/**
 * Calls Gemini with a prompt and returns the raw text response.
 */
const callGemini = async (prompt) => {
  const model = genAI.getGenerativeModel({
    model: "gemini-2.5-flash",
    systemInstruction: SYSTEM_INSTRUCTIONS,
  });
  const result = await model.generateContent(prompt);
  return result.response.text();
};

/**
 * Calls OpenAI's chat completions endpoint and returns the raw text response.
 */
const callOpenAI = async (prompt) => {
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        { role: 'system', content: SYSTEM_INSTRUCTIONS },
        { role: 'user', content: prompt },
      ],
      response_format: { type: 'json_object' },
      temperature: 0.4,
    }),
  });

  if (!response.ok) {
    const errBody = await response.text();
    throw new Error(`OpenAI API error: ${response.status} - ${errBody}`);
  }

  const data = await response.json();
  return data.choices[0].message.content;
};

/**
 * Strips markdown code fences if the model ignores instructions and wraps JSON in ```json ... ```
 */
const cleanJsonString = (raw) => {
  return raw
    .trim()
    .replace(/^```json/i, '')
    .replace(/^```/, '')
    .replace(/```$/, '')
    .trim();
};

/**
 * Sends a prompt to whichever provider is configured and parses the JSON response.
 * Throws if no provider is configured or parsing fails - callers should catch and
 * fall back to safe defaults / inform the user.
 */
const getStructuredAIResponse = async (prompt) => {
  if (AI_PROVIDER === 'openai') {
    if (!process.env.OPENAI_API_KEY) throw new Error('OPENAI_API_KEY is not configured');
    const raw = await callOpenAI(prompt);
    return JSON.parse(cleanJsonString(raw));
  }

  if (!process.env.GEMINI_API_KEY) throw new Error('GEMINI_API_KEY is not configured');
  const raw = await callGemini(prompt);
  return JSON.parse(cleanJsonString(raw));
};

// ---------------------------------------------------------------------------
// Prompt builders
// ---------------------------------------------------------------------------

const buildResumeParsePrompt = (resumeText) => `
Parse the following resume text and extract structured information.
Return ONLY a JSON object with this exact shape:
{
  "name": "string",
  "email": "string",
  "phone": "string",
  "skills": ["string"],
  "education": ["string - each entry as 'Degree, Institution, Year'"],
  "experience": ["string - each entry summarizing role, company, duration, key responsibility"],
  "projects": ["string - each entry with project name and one-line description"],
  "certifications": ["string"]
}

Resume text:
"""
${resumeText}
"""
`;

const buildATSAnalysisPrompt = (resumeText, targetRole) => `
Act as a professional ATS (Applicant Tracking System) and senior technical recruiter.
Analyze the following resume${targetRole ? ` for the target role of "${targetRole}"` : ''}.

Return ONLY a JSON object with this exact shape:
{
  "atsScore": number (0-100),
  "missingSkills": ["string"],
  "recommendedSkills": ["string - technical skills relevant to the target role that are missing"],
  "grammarIssues": [{"text": "original problematic phrase", "suggestion": "corrected version"}],
  "formattingIssues": ["string - formatting/structure problems found"],
  "strongerBulletPoints": [{"original": "string", "improved": "string - rewritten using action verbs and quantifiable impact"}],
  "suggestedCertifications": ["string"],
  "suggestedProjects": ["string - project ideas that would strengthen the resume for the target role"],
  "overallHiringReadiness": "one of: 'Strong', 'Moderate', 'Needs Improvement'",
  "summary": "string - 2-3 sentence overall assessment"
}

Resume text:
"""
${resumeText}
"""
`;

const buildJDMatchPrompt = (resumeText, jobDescriptionText) => `
Compare the following resume against the job description and act as an ATS matching engine.

Return ONLY a JSON object with this exact shape:
{
  "matchPercentage": number (0-100),
  "missingKeywords": ["string - important keywords from the JD absent in the resume"],
  "matchedKeywords": ["string"],
  "suggestedImprovements": ["string - specific actionable suggestions to improve the match"],
  "overallHiringReadiness": "one of: 'Strong', 'Moderate', 'Needs Improvement'",
  "summary": "string - 2-3 sentence assessment of fit for this specific role"
}

Resume text:
"""
${resumeText}
"""

Job Description:
"""
${jobDescriptionText}
"""
`;

module.exports = {
  getStructuredAIResponse,
  buildResumeParsePrompt,
  buildATSAnalysisPrompt,
  buildJDMatchPrompt,
};
