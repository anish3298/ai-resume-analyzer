const express = require('express');
const router = express.Router();
const { uploadResume, getMyResumes, getResumeById, deleteResume } = require('../controllers/resumeController');
const { protect } = require('../middleware/auth');
const upload = require('../middleware/upload');

router.use(protect);

router.post('/upload', upload.single('resume'), uploadResume);
router.get('/', getMyResumes);
router.get('/:id', getResumeById);
router.delete('/:id', deleteResume);

module.exports = router;
