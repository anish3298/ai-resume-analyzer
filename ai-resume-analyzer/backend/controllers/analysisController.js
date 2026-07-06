const Resume = require('../models/Resume');
const AnalysisReport = require('../models/AnalysisReport');
const JobDescription = require('../models/JobDescription');
const ActivityLog = require('../models/ActivityLog');
const asyncHandler = require('../utils/asyncHandler');
const {
  getStructuredAIResponse,
  buildATSAnalysisPrompt,
  buildJDMatchPrompt,
} = require('../utils/aiService');
const { generateAnalysisReportPDF } = require('../utils/pdfReportGenerator');

/**
 * @route   POST /api/analysis/ats/:resumeId
 * @body    { targetRole?: string }
 * @access  Private (candidate)
 * Runs a full ATS-style analysis on a resume: score, missing skills,
 * grammar issues, formatting issues, stronger bullet points, etc.
 */
const analyzeResumeATS = asyncHandler(async (req, res) => {
  const { targetRole } = req.body;
  const resume = await Resume.findOne({ _id: req.params.resumeId, user: req.user._id });

  if (!resume) {
    return res.status(404).json({ success: false, message: 'Resume not found' });
  }

  const prompt = buildATSAnalysisPrompt(resume.rawText, targetRole);
  let aiResult;
  try {
    aiResult = await getStructuredAIResponse(prompt);
  } catch (err) {
    return res.status(502).json({
      success: false,
      message: `AI analysis failed: ${err.message}. Please verify your AI provider API key is configured.`,
    });
  }

  const analysis = await AnalysisReport.create({
    user: req.user._id,
    resume: resume._id,
    atsScore: aiResult.atsScore ?? 0,
    missingSkills: aiResult.missingSkills || [],
    recommendedSkills: aiResult.recommendedSkills || [],
    grammarIssues: aiResult.grammarIssues || [],
    formattingIssues: aiResult.formattingIssues || [],
    strongerBulletPoints: aiResult.strongerBulletPoints || [],
    suggestedCertifications: aiResult.suggestedCertifications || [],
    suggestedProjects: aiResult.suggestedProjects || [],
    overallHiringReadiness: aiResult.overallHiringReadiness || 'Moderate',
    summary: aiResult.summary || '',
    rawAIResponse: aiResult,
  });

  resume.status = 'analyzed';
  await resume.save();

  await ActivityLog.create({
    user: req.user._id,
    action: 'RESUME_ANALYZED',
    metadata: { resumeId: resume._id, analysisId: analysis._id },
    ipAddress: req.ip,
  });

  res.status(201).json({ success: true, analysis });
});

/**
 * @route   POST /api/analysis/jd-match/:resumeId
 * @body    { jobDescriptionText: string, title?: string, company?: string }
 * @access  Private (candidate)
 * Compares a resume against a pasted job description.
 */
const matchJobDescription = asyncHandler(async (req, res) => {
  const { jobDescriptionText, title, company } = req.body;

  if (!jobDescriptionText || jobDescriptionText.trim().length < 20) {
    return res.status(400).json({ success: false, message: 'Please provide a valid job description' });
  }

  const resume = await Resume.findOne({ _id: req.params.resumeId, user: req.user._id });
  if (!resume) {
    return res.status(404).json({ success: false, message: 'Resume not found' });
  }

  const jd = await JobDescription.create({
    user: req.user._id,
    title: title || 'Untitled Job Description',
    company: company || '',
    rawText: jobDescriptionText,
  });

  const prompt = buildJDMatchPrompt(resume.rawText, jobDescriptionText);
  let aiResult;
  try {
    aiResult = await getStructuredAIResponse(prompt);
  } catch (err) {
    return res.status(502).json({
      success: false,
      message: `AI matching failed: ${err.message}. Please verify your AI provider API key is configured.`,
    });
  }

  jd.extractedKeywords = aiResult.matchedKeywords || [];
  await jd.save();

  const analysis = await AnalysisReport.create({
    user: req.user._id,
    resume: resume._id,
    jobDescription: jd._id,
    atsScore: aiResult.matchPercentage ?? 0, // reuse score field for consistency in history views
    matchPercentage: aiResult.matchPercentage ?? 0,
    missingKeywords: aiResult.missingKeywords || [],
    overallHiringReadiness: aiResult.overallHiringReadiness || 'Moderate',
    summary: aiResult.summary || '',
    rawAIResponse: aiResult,
  });

  await ActivityLog.create({
    user: req.user._id,
    action: 'JD_MATCHED',
    metadata: { resumeId: resume._id, jdId: jd._id, analysisId: analysis._id },
    ipAddress: req.ip,
  });

  res.status(201).json({ success: true, analysis, jobDescription: jd });
});

/**
 * @route   GET /api/analysis/history
 * @access  Private (candidate)
 */
const getAnalysisHistory = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;
  const search = req.query.search || '';

  const filter = { user: req.user._id };

  const [reports, total] = await Promise.all([
    AnalysisReport.find(filter)
      .populate('resume', 'originalFileName')
      .populate('jobDescription', 'title company')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),
    AnalysisReport.countDocuments(filter),
  ]);

  const filtered = search
    ? reports.filter((r) =>
        r.resume?.originalFileName?.toLowerCase().includes(search.toLowerCase())
      )
    : reports;

  res.json({
    success: true,
    reports: filtered,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
});

/**
 * @route   GET /api/analysis/dashboard-stats
 * @access  Private (candidate)
 * Aggregated stats for the candidate's dashboard: totals, average score, trend.
 */
const getDashboardStats = asyncHandler(async (req, res) => {
  const reports = await AnalysisReport.find({ user: req.user._id }).sort({ createdAt: 1 });

  const totalAnalyzed = reports.length;
  const averageScore = totalAnalyzed
    ? Math.round(reports.reduce((sum, r) => sum + (r.atsScore || 0), 0) / totalAnalyzed)
    : 0;

  const trend = reports.map((r) => ({
    date: r.createdAt,
    score: r.atsScore,
  }));

  // Aggregate most frequently missing skills across all reports for a skill-gap chart
  const skillGapCounts = {};
  reports.forEach((r) => {
    (r.missingSkills || []).forEach((skill) => {
      skillGapCounts[skill] = (skillGapCounts[skill] || 0) + 1;
    });
  });
  const skillGap = Object.entries(skillGapCounts)
    .map(([skill, count]) => ({ skill, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 10);

  res.json({
    success: true,
    stats: { totalAnalyzed, averageScore, trend, skillGap },
  });
});

/**
 * @route   GET /api/analysis/:id/report-pdf
 * @access  Private (candidate - own analysis only)
 * Generates (or reuses) a downloadable PDF report for an analysis.
 */
const downloadReportPDF = asyncHandler(async (req, res) => {
  const analysis = await AnalysisReport.findOne({ _id: req.params.id, user: req.user._id }).populate(
    'resume'
  );
  if (!analysis) {
    return res.status(404).json({ success: false, message: 'Analysis report not found' });
  }

  const filePath = await generateAnalysisReportPDF(analysis, analysis.resume, req.user);
  analysis.reportPdfPath = filePath;
  await analysis.save();

  await ActivityLog.create({
    user: req.user._id,
    action: 'REPORT_DOWNLOADED',
    metadata: { analysisId: analysis._id },
    ipAddress: req.ip,
  });

  res.download(filePath, `resume-analysis-report-${analysis._id}.pdf`);
});

module.exports = {
  analyzeResumeATS,
  matchJobDescription,
  getAnalysisHistory,
  getDashboardStats,
  downloadReportPDF,
};
