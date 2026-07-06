const express = require('express');
const router = express.Router();
const { updateProfile, changePassword } = require('../controllers/userController');
const { protect } = require('../middleware/auth');
const { changePasswordValidation } = require('../utils/validators');

router.use(protect);

router.put('/profile', updateProfile);
router.put('/change-password', changePasswordValidation, changePassword);

module.exports = router;
