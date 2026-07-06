const PDFDocument = require('pdfkit');
const fs = require('fs');
const path = require('path');

/**
 * Generates a downloadable PDF improvement report for a given analysis.
 * Returns the absolute file path of the generated PDF.
 */
const generateAnalysisReportPDF = async (analysis, resume, user) => {
  const reportsDir = path.join(__dirname, '..', 'uploads', 'reports');
  if (!fs.existsSync(reportsDir)) fs.mkdirSync(reportsDir, { recursive: true });

  const fileName = `report-${analysis._id}.pdf`;
  const filePath = path.join(reportsDir, fileName);

  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const stream = fs.createWriteStream(filePath);
    doc.pipe(stream);

    doc.fontSize(20).text('Resume Analysis Report', { align: 'center' });
    doc.moveDown();
    doc.fontSize(10).fillColor('gray').text(`Generated for: ${user.name} (${user.email})`, { align: 'center' });
    doc.text(`Date: ${new Date().toLocaleDateString()}`, { align: 'center' });
    doc.moveDown(1.5);
    doc.fillColor('black');

    doc.fontSize(14).text(`ATS Score: ${analysis.atsScore}/100`, { underline: true });
    if (analysis.matchPercentage !== null && analysis.matchPercentage !== undefined) {
      doc.fontSize(14).text(`Job Match: ${analysis.matchPercentage}%`);
    }
    doc.fontSize(12).text(`Hiring Readiness: ${analysis.overallHiringReadiness}`);
    doc.moveDown();

    doc.fontSize(13).text('Summary', { underline: true });
    doc.fontSize(11).text(analysis.summary || 'N/A');
    doc.moveDown();

    const section = (title, items) => {
      doc.fontSize(13).text(title, { underline: true });
      if (!items || items.length === 0) {
        doc.fontSize(11).text('None found.');
      } else {
        items.forEach((item) => {
          const line = typeof item === 'string' ? item : JSON.stringify(item);
          doc.fontSize(11).text(`• ${line}`);
        });
      }
      doc.moveDown();
    };

    section('Missing Skills', analysis.missingSkills);
    section('Recommended Skills', analysis.recommendedSkills);
    section('Formatting Issues', analysis.formattingIssues);
    section('Suggested Certifications', analysis.suggestedCertifications);
    section('Suggested Projects', analysis.suggestedProjects);

    if (analysis.strongerBulletPoints && analysis.strongerBulletPoints.length > 0) {
      doc.fontSize(13).text('Stronger Bullet Point Suggestions', { underline: true });
      analysis.strongerBulletPoints.forEach((bp) => {
        doc.fontSize(11).fillColor('red').text(`- Original: ${bp.original}`);
        doc.fillColor('green').text(`+ Improved: ${bp.improved}`);
        doc.fillColor('black').moveDown(0.5);
      });
    }

    doc.end();

    stream.on('finish', () => resolve(filePath));
    stream.on('error', reject);
  });
};

module.exports = { generateAnalysisReportPDF };
