const express = require('express');
const router = express.Router();
const {
  analyzeResumeATS,
  matchJobDescription,
  getAnalysisHistory,
  getDashboardStats,
  downloadReportPDF,
} = require('../controllers/analysisController');
const { protect } = require('../middleware/auth');
const { analysisLimiter } = require('../middleware/rateLimiter');

router.use(protect);

router.post('/ats/:resumeId', analysisLimiter, analyzeResumeATS);
router.post('/jd-match/:resumeId', analysisLimiter, matchJobDescription);
router.get('/history', getAnalysisHistory);
router.get('/dashboard-stats', getDashboardStats);
router.get('/:id/report-pdf', downloadReportPDF);

module.exports = router;
