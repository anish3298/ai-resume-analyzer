const fs = require('fs');
const User = require('../models/User');
const Resume = require('../models/Resume');
const AnalysisReport = require('../models/AnalysisReport');
const ActivityLog = require('../models/ActivityLog');
const asyncHandler = require('../utils/asyncHandler');

/**
 * @route   GET /api/admin/users
 * @access  Private (admin)
 */
const getAllUsers = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;
  const search = req.query.search || '';

  const filter = {
    role: 'candidate',
    ...(search && {
      $or: [
        { name: { $regex: search, $options: 'i' } },
        { email: { $regex: search, $options: 'i' } },
      ],
    }),
  };

  const [users, total] = await Promise.all([
    User.find(filter).sort({ createdAt: -1 }).skip(skip).limit(limit),
    User.countDocuments(filter),
  ]);

  res.json({
    success: true,
    users,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
});

/**
 * @route   DELETE /api/admin/users/:id
 * @access  Private (admin)
 */
const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);
  if (!user) return res.status(404).json({ success: false, message: 'User not found' });

  // Cascade delete: resumes, files, analysis reports
  const resumes = await Resume.find({ user: user._id });
  resumes.forEach((r) => {
    if (fs.existsSync(r.filePath)) fs.unlinkSync(r.filePath);
  });
  await Resume.deleteMany({ user: user._id });
  await AnalysisReport.deleteMany({ user: user._id });
  await user.deleteOne();

  await ActivityLog.create({
    user: req.user._id,
    action: 'ADMIN_DELETED_USER',
    metadata: { deletedUserId: req.params.id },
    ipAddress: req.ip,
  });

  res.json({ success: true, message: 'User and all associated data deleted successfully' });
});

/**
 * @route   GET /api/admin/resumes
 * @access  Private (admin)
 */
const getAllResumes = asyncHandler(async (req, res) => {
  const page = parseInt(req.query.page) || 1;
  const limit = parseInt(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  const [resumes, total] = await Promise.all([
    Resume.find().populate('user', 'name email').sort({ createdAt: -1 }).skip(skip).limit(limit),
    Resume.countDocuments(),
  ]);

  res.json({
    success: true,
    resumes,
    pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
  });
});

/**
 * @route   DELETE /api/admin/resumes/:id
 * @access  Private (admin)
 */
const deleteResumeAdmin = asyncHandler(async (req, res) => {
  const resume = await Resume.findById(req.params.id);
  if (!resume) return res.status(404).json({ success: false, message: 'Resume not found' });

  if (fs.existsSync(resume.filePath)) fs.unlinkSync(resume.filePath);
  await AnalysisReport.deleteMany({ resume: resume._id });
  await resume.deleteOne();

  await ActivityLog.create({
    user: req.user._id,
    action: 'ADMIN_DELETED_RESUME',
    metadata: { deletedResumeId: req.params.id },
    ipAddress: req.ip,
  });

  res.json({ success: true, message: 'Resume deleted successfully' });
});

/**
 * @route   GET /api/admin/analytics
 * @access  Private (admin)
 * Platform-wide analytics for the admin dashboard.
 */
const getAdminAnalytics = asyncHandler(async (req, res) => {
  const [totalUsers, totalResumes, totalAnalyses, allReports] = await Promise.all([
    User.countDocuments({ role: 'candidate' }),
    Resume.countDocuments(),
    AnalysisReport.countDocuments(),
    AnalysisReport.find().select('atsScore createdAt'),
  ]);

  const averageATSScore = allReports.length
    ? Math.round(allReports.reduce((sum, r) => sum + (r.atsScore || 0), 0) / allReports.length)
    : 0;

  // Signups per day for the last 30 days
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const recentUsers = await User.find({ role: 'candidate', createdAt: { $gte: thirtyDaysAgo } }).select(
    'createdAt'
  );
  const signupsByDay = {};
  recentUsers.forEach((u) => {
    const day = u.createdAt.toISOString().slice(0, 10);
    signupsByDay[day] = (signupsByDay[day] || 0) + 1;
  });

  res.json({
    success: true,
    analytics: {
      totalUsers,
      totalResumes,
      totalAnalyses,
      averageATSScore,
      signupsByDay: Object.entries(signupsByDay).map(([date, count]) => ({ date, count })),
    },
  });
});

module.exports = { getAllUsers, deleteUser, getAllResumes, deleteResumeAdmin, getAdminAnalytics };
