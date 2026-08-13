import mongoose from 'mongoose';

const contactSubmissionSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true, maxlength: 120 },
    email: { type: String, required: true, trim: true, lowercase: true, maxlength: 254 },
    phone: { type: String, required: true, trim: true, maxlength: 40 },
    subject: { type: String, required: true, trim: true, maxlength: 200 },
    body: { type: String, required: true, trim: true, maxlength: 5000 },
    notified: { type: Boolean, default: false },
    sourceIp: { type: String, default: '', trim: true },
  },
  { timestamps: true, versionKey: false }
);

contactSubmissionSchema.index({ createdAt: -1 });

export const ContactSubmission = mongoose.model('ContactSubmission', contactSubmissionSchema);
