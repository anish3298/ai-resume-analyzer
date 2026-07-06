const mongoose = require('mongoose');

const resumeSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    originalFileName: { type: String, required: true },
    storedFileName: { type: String, required: true },
    filePath: { type: String, required: true },
    fileSize: { type: Number },
    rawText: { type: String }, // full extracted text from the PDF
    parsed: {
      name: { type: String, default: '' },
      email: { type: String, default: '' },
      phone: { type: String, default: '' },
      skills: [{ type: String }],
      education: [{ type: String }],
      experience: [{ type: String }],
      projects: [{ type: String }],
      certifications: [{ type: String }],
    },
    status: { type: String, enum: ['uploaded', 'parsed', 'analyzed', 'failed'], default: 'uploaded' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Resume', resumeSchema);
