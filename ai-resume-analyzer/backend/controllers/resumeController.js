const fs = require('fs');
const Resume = require('../models/Resume');
const ActivityLog = require('../models/ActivityLog');
const asyncHandler = require('../utils/asyncHandler');
const { extractTextFromPDF, extractBasicFields } = require('../utils/pdfParser');
const { getStructuredAIResponse, buildResumeParsePrompt } = require('../utils/aiService');

/**
 * @route   POST /api/resumes/upload
 * @access  Private (candidate)
 * Uploads a PDF resume, extracts its text, and asks the AI to parse it
 * into structured fields (name, skills, education, etc).
 */
const uploadResume = asyncHandler(async (req, res) => {
  if (!req.file) {
    return res.status(400).json({ success: false, message: 'No PDF file uploaded' });
  }

  const rawText = await extractTextFromPDF(req.file.path);
  const basicFields = extractBasicFields(rawText);

  const resume = await Resume.create({
    user: req.user._id,
    originalFileName: req.file.originalname,
    storedFileName: req.file.filename,
    filePath: req.file.path,
    fileSize: req.file.size,
    rawText,
    parsed: { email: basicFields.email, phone: basicFields.phone },
    status: 'uploaded',
  });

  // Attempt AI-based structured parsing; fall back gracefully if AI is unavailable
  try {
    const prompt = buildResumeParsePrompt(rawText);
    const parsed = await getStructuredAIResponse(prompt);

    resume.parsed = {
      name: parsed.name || '',
      email: parsed.email || basicFields.email,
      phone: parsed.phone || basicFields.phone,
      skills: parsed.skills || [],
      education: parsed.education || [],
      experience: parsed.experience || [],
      projects: parsed.projects || [],
      certifications: parsed.certifications || [],
    };
    resume.status = 'parsed';
  } catch (err) {
    console.error('AI parsing failed, keeping basic extraction only:', err.message);
  }

  await resume.save();

  await ActivityLog.create({
    user: req.user._id,
    action: 'RESUME_UPLOADED',
    metadata: { resumeId: resume._id, fileName: resume.originalFileName },
    ipAddress: req.ip,
  });

  res.status(201).json({ success: true, resume });
});

/**
 * @route   GET /api/resumes
 * @access  Private (candidate) - lists the logged-in user's resumes
 */
const getMyResumes = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const [resumes, total] = await Promise.all([
    Resume.find({ user: req.user._id }).sort({ createdAt: -1 }).skip(skip).limit(limit),
    Resume.countDocuments({ user: req.user._id }),
  ]);

  res.json({
    success: true,
    resumes,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
});

/**
 * @route   GET /api/resumes/:id
 * @access  Private (candidate - own resume only)
 */
const getResumeById = asyncHandler(async (req, res) => {
  const resume = await Resume.findOne({ _id: req.params.id, user: req.user._id });
  if (!resume) {
    return res.status(404).json({ success: false, message: 'Resume not found' });
  }
  res.json({ success: true, resume });
});

/**
 * @route   DELETE /api/resumes/:id
 * @access  Private (candidate - own resume only)
 */
const deleteResume = asyncHandler(async (req, res) => {
  const resume = await Resume.findOne({ _id: req.params.id, user: req.user._id });
  if (!resume) {
    return res.status(404).json({ success: false, message: 'Resume not found' });
  }

  if (fs.existsSync(resume.filePath)) fs.unlinkSync(resume.filePath);
  await resume.deleteOne();

  res.json({ success: true, message: 'Resume deleted successfully' });
});

module.exports = { uploadResume, getMyResumes, getResumeById, deleteResume };
