const User = require('../models/User');
const asyncHandler = require('../utils/asyncHandler');

/**
 * @route   PUT /api/users/profile
 * @access  Private
 */
const updateProfile = asyncHandler(async (req, res) => {
  const { name, phone, targetRole, avatarUrl } = req.body;

  const user = await User.findById(req.user._id);
  if (name) user.name = name;
  if (phone !== undefined) user.profile.phone = phone;
  if (targetRole !== undefined) user.profile.targetRole = targetRole;
  if (avatarUrl !== undefined) user.profile.avatarUrl = avatarUrl;

  await user.save();
  res.json({ success: true, user: user.toSafeObject() });
});

/**
 * @route   PUT /api/users/change-password
 * @access  Private
 */
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const user = await User.findById(req.user._id).select('+password');
  const isMatch = await user.comparePassword(currentPassword);
  if (!isMatch) {
    return res.status(400).json({ success: false, message: 'Current password is incorrect' });
  }

  user.password = newPassword;
  await user.save();
  res.json({ success: true, message: 'Password updated successfully' });
});

module.exports = { updateProfile, changePassword };
