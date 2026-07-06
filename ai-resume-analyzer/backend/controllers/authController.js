const crypto = require('crypto');
const User = require('../models/User');
const ActivityLog = require('../models/ActivityLog');
const generateToken = require('../utils/generateToken');
const asyncHandler = require('../utils/asyncHandler');
const sendEmail = require('../utils/sendEmail');

/**
 * @route   POST /api/auth/register
 * @access  Public
 */
const register = asyncHandler(async (req, res) => {
  const { name, email, password } = req.body;

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(409).json({ success: false, message: 'Email is already registered' });
  }

  const verificationToken = crypto.randomBytes(32).toString('hex');

  const user = await User.create({
    name,
    email,
    password,
    verificationToken,
    verificationTokenExpires: Date.now() + 24 * 60 * 60 * 1000, // 24h
  });

  const verifyUrl = `${process.env.CLIENT_URL}/verify-email?token=${verificationToken}`;
  await sendEmail({
    to: email,
    subject: 'Verify your email - AI Resume Analyzer',
    html: `<p>Hi ${name},</p><p>Please verify your email by clicking <a href="${verifyUrl}">here</a>. This link expires in 24 hours.</p>`,
  });

  await ActivityLog.create({ user: user._id, action: 'USER_REGISTERED', ipAddress: req.ip });

  const token = generateToken(user._id, user.role);

  res.status(201).json({
    success: true,
    message: 'Registration successful. Please check your email to verify your account.',
    token,
    user: user.toSafeObject(),
  });
});

/**
 * @route   POST /api/auth/login
 * @access  Public
 */
const login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email }).select('+password');
  if (!user || !(await user.comparePassword(password))) {
    return res.status(401).json({ success: false, message: 'Invalid email or password' });
  }

  if (!user.isActive) {
    return res.status(403).json({ success: false, message: 'Your account has been deactivated' });
  }

  await ActivityLog.create({ user: user._id, action: 'USER_LOGIN', ipAddress: req.ip });

  const token = generateToken(user._id, user.role);

  res.json({ success: true, token, user: user.toSafeObject() });
});

/**
 * @route   GET /api/auth/verify-email?token=...
 * @access  Public
 */
const verifyEmail = asyncHandler(async (req, res) => {
  const { token } = req.query;

  const user = await User.findOne({
    verificationToken: token,
    verificationTokenExpires: { $gt: Date.now() },
  }).select('+verificationToken +verificationTokenExpires');

  if (!user) {
    return res.status(400).json({ success: false, message: 'Invalid or expired verification token' });
  }

  user.isVerified = true;
  user.verificationToken = undefined;
  user.verificationTokenExpires = undefined;
  await user.save();

  res.json({ success: true, message: 'Email verified successfully' });
});

/**
 * @route   POST /api/auth/forgot-password
 * @access  Public
 */
const forgotPassword = asyncHandler(async (req, res) => {
  const { email } = req.body;
  const user = await User.findOne({ email });

  // Always respond success to avoid leaking which emails are registered
  if (!user) {
    return res.json({ success: true, message: 'If that email is registered, a reset link has been sent.' });
  }

  const resetToken = crypto.randomBytes(32).toString('hex');
  user.resetPasswordToken = resetToken;
  user.resetPasswordExpires = Date.now() + 60 * 60 * 1000; // 1 hour
  await user.save();

  const resetUrl = `${process.env.CLIENT_URL}/reset-password?token=${resetToken}`;
  await sendEmail({
    to: email,
    subject: 'Password Reset - AI Resume Analyzer',
    html: `<p>You requested a password reset. Click <a href="${resetUrl}">here</a> to set a new password. This link expires in 1 hour.</p>`,
  });

  await ActivityLog.create({ user: user._id, action: 'PASSWORD_RESET_REQUESTED', ipAddress: req.ip });

  res.json({ success: true, message: 'If that email is registered, a reset link has been sent.' });
});

/**
 * @route   POST /api/auth/reset-password
 * @access  Public
 */
const resetPassword = asyncHandler(async (req, res) => {
  const { token, newPassword } = req.body;

  const user = await User.findOne({
    resetPasswordToken: token,
    resetPasswordExpires: { $gt: Date.now() },
  }).select('+resetPasswordToken +resetPasswordExpires');

  if (!user) {
    return res.status(400).json({ success: false, message: 'Invalid or expired reset token' });
  }

  user.password = newPassword;
  user.resetPasswordToken = undefined;
  user.resetPasswordExpires = undefined;
  await user.save();

  await ActivityLog.create({ user: user._id, action: 'PASSWORD_RESET', ipAddress: req.ip });

  res.json({ success: true, message: 'Password reset successfully. You can now log in.' });
});

/**
 * @route   GET /api/auth/me
 * @access  Private
 */
const getMe = asyncHandler(async (req, res) => {
  res.json({ success: true, user: req.user.toSafeObject() });
});

module.exports = { register, login, verifyEmail, forgotPassword, resetPassword, getMe };
