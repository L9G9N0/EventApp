import { z } from 'zod';

const indianPhoneRegex = /^(?:\+91|0)?[6-9]\d{9}$/;

export const registrationValidationSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name must be under 100 characters'),
  email: z.string().min(1, 'Email is required').email('Please enter a valid email address'),
  phone: z.string().min(1, 'Phone number is required').refine(
    (val) => indianPhoneRegex.test(val),
    { message: 'Please enter a valid Indian mobile number (e.g. 9876543210)' }
  ),
  college: z.string().max(150, 'College must be under 150 characters').optional().or(z.literal('')),
  company: z.string().max(150, 'Company must be under 150 characters').optional().or(z.literal('')),
  source: z.enum(['LinkedIn', 'WhatsApp', 'Instagram', 'Email', 'Direct'], {
    errorMap: () => ({ message: 'Please select a valid referral source' }),
  }),
  ticketType: z.enum(['General Admission', 'VIP Pass', 'Student Discount'], {
    errorMap: () => ({ message: 'Please select a valid ticket type' }),
  }).default('General Admission'),
  couponCode: z.string().max(20, 'Coupon code is too long').optional().or(z.literal('')),
  referralCode: z.string().max(20, 'Referral code is too long').optional().or(z.literal('')),
});

export type RegistrationInput = z.infer<typeof registrationValidationSchema>;
