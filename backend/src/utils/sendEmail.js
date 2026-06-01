import nodemailer from 'nodemailer';

/**
 * Reusable SMTP transporter.
 * All credentials come from environment variables — nothing is hardcoded.
 */
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST,
  port: Number(process.env.EMAIL_PORT) || 587,
  secure: Number(process.env.EMAIL_PORT) === 465, // true for port 465 (SSL), false for STARTTLS
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

/**
 * Sends a transactional email.
 *
 * @param {object} options
 * @param {string} options.to       - Recipient email address
 * @param {string} options.subject  - Email subject line
 * @param {string} options.html     - HTML body content
 */
const sendEmail = async ({ to, subject, html }) => {
  await transporter.sendMail({
    from: `"KyuR Lost & Found" <${process.env.EMAIL_USER}>`,
    to,
    subject,
    html,
  });
};

export default sendEmail;
