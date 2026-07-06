const nodemailer = require('nodemailer');

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

/**
 * Sends an email. Fails silently with a console warning in development
 * if SMTP credentials are not configured, so the rest of the app keeps working.
 */
const sendEmail = async ({ to, subject, html }) => {
  if (!process.env.SMTP_USER || !process.env.SMTP_PASS) {
    console.warn(`[sendEmail] SMTP not configured - skipping email to ${to}: ${subject}`);
    return;
  }
  await transporter.sendMail({
    from: `"AI Resume Analyzer" <${process.env.SMTP_USER}>`,
    to,
    subject,
    html,
  });
};

module.exports = sendEmail;
