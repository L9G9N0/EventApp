import { z } from 'zod';

// Regex matching Indian phone numbers: optional +91 or 0, followed by 10 digits starting with 6-9
const indianPhoneRegex = /^(?:\+91|0)?[6-9]\d{9}$/;

export const registrationValidationSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be less than 100 characters'),
  email: z.string().min(1, 'Email is required').email('Please enter a valid email address'),
  phone: z.string().min(1, 'Phone number is required').refine(
    (val) => indianPhoneRegex.test(val),
    { message: 'Please enter a valid Indian mobile number (e.g., 9876543210)' }
  ),
  college: z.string().max(150, 'College name must be less than 150 characters').optional().or(z.literal('')),
  company: z.string().max(150, 'Company name must be less than 150 characters').optional().or(z.literal('')),
  source: z.enum(['LinkedIn', 'WhatsApp', 'Instagram', 'Email', 'Direct'], {
    errorMap: () => ({ message: 'Please select a valid referral source' }),
  }),
});

export type RegistrationInput = z.infer<typeof registrationValidationSchema>;
