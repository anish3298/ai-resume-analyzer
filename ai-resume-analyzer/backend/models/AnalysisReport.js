const mongoose = require('mongoose');

const analysisReportSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    resume: { type: mongoose.Schema.Types.ObjectId, ref: 'Resume', required: true },
    jobDescription: { type: mongoose.Schema.Types.ObjectId, ref: 'JobDescription', default: null },

    atsScore: { type: Number, min: 0, max: 100, required: true },
    matchPercentage: { type: Number, min: 0, max: 100, default: null }, // vs JD, if provided

    missingSkills: [{ type: String }],
    missingKeywords: [{ type: String }],
    recommendedSkills: [{ type: String }],

    grammarIssues: [
      {
        text: String,
        suggestion: String,
      },
    ],
    formattingIssues: [{ type: String }],

    strongerBulletPoints: [
      {
        original: String,
        improved: String,
      },
    ],

    suggestedCertifications: [{ type: String }],
    suggestedProjects: [{ type: String }],

    overallHiringReadiness: { type: String, default: '' }, // e.g., "Strong", "Moderate", "Needs Work"
    summary: { type: String, default: '' },

    reportPdfPath: { type: String, default: '' },

    rawAIResponse: { type: mongoose.Schema.Types.Mixed }, // store the structured JSON from AI for auditing
  },
  { timestamps: true }
);

module.exports = mongoose.model('AnalysisReport', analysisReportSchema);
