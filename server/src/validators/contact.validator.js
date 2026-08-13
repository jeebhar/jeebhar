import { z } from 'zod';

/**
 * VALIDATOR — the shape of a valid contact submission.
 *
 * Declared once and shared by the route middleware. Controllers can therefore
 * assume `req.validated` is trustworthy and skip defensive checks.
 */
export const contactSubmissionSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters.').max(120),
  email: z.string().trim().toLowerCase().email('Enter a valid email address.').max(254),
  phone: z
    .string()
    .trim()
    .min(7, 'Enter a valid phone number.')
    .max(40)
    .regex(/^[\d\s()+-]+$/, 'Phone number may only contain digits, spaces, +, -, ( and ).'),
  subject: z.string().trim().min(3, 'Subject must be at least 3 characters.').max(200),
  body: z.string().trim().min(10, 'Message must be at least 10 characters.').max(5000),
});
