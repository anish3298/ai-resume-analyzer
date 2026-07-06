const express = require('express');
const router = express.Router();
const {
  getAllUsers,
  deleteUser,
  getAllResumes,
  deleteResumeAdmin,
  getAdminAnalytics,
} = require('../controllers/adminController');
const { protect } = require('../middleware/auth');
const { adminOnly } = require('../middleware/admin');

router.use(protect, adminOnly);

router.get('/users', getAllUsers);
router.delete('/users/:id', deleteUser);
router.get('/resumes', getAllResumes);
router.delete('/resumes/:id', deleteResumeAdmin);
router.get('/analytics', getAdminAnalytics);

module.exports = router;
