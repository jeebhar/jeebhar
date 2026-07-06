import nodemailer from "nodemailer";

export const sendContactNotification = async (submission) => {
  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = Number(process.env.SMTP_PORT || 587);
  const smtpUser = process.env.SMTP_USER;
  const smtpPass = process.env.SMTP_PASS;
  const mailTo = process.env.MAIL_TO;
  const mailFrom = process.env.MAIL_FROM;

  if (!smtpHost || !smtpUser || !smtpPass || !mailTo || !mailFrom) {
    throw new Error(
      "Missing SMTP/MAIL config. Set SMTP_HOST, SMTP_USER, SMTP_PASS, MAIL_TO, MAIL_FROM."
    );
  }

  const transporter = nodemailer.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpPort === 465,
    auth: {
      user: smtpUser,
      pass: smtpPass
    }
  });

  const messageText = [
    "New contact submission from Jeebhar website",
    "",
    `Name: ${submission.name}`,
    `Email: ${submission.email}`,
    `Phone: ${submission.phone}`,
    `Subject: ${submission.subject}`,
    "",
    "Message:",
    submission.body
  ].join("\n");

  await transporter.sendMail({
    from: mailFrom,
    to: mailTo,
    subject: `Jeebhar Inquiry: ${submission.subject}`,
    text: messageText
  });
};
