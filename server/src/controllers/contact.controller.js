import { ContactSubmission } from "../models/contact-submission.model.js";
import { sendContactNotification } from "../services/mail.service.js";

export const submitContact = async (req, res, next) => {
  try {
    const { name, email, phone, subject, body } = req.body;
    const submission = await ContactSubmission.create({
      name,
      email,
      phone,
      subject,
      body
    });

    await sendContactNotification(submission);
    res.status(201).json({ message: "Contact request sent successfully." });
  } catch (error) {
    next(error);
  }
};
