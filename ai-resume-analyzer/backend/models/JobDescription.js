const mongoose = require('mongoose');

const jobDescriptionSchema = new mongoose.Schema(
  {
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    title: { type: String, default: 'Untitled Job Description' },
    company: { type: String, default: '' },
    rawText: { type: String, required: true },
    extractedKeywords: [{ type: String }],
  },
  { timestamps: true }
);

module.exports = mongoose.model('JobDescription', jobDescriptionSchema);
