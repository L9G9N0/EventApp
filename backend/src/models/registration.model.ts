import { Schema, model, Document, Types } from 'mongoose';

export interface IRegistration extends Document {
  eventId: Types.ObjectId;
  name: string;
  email: string;
  phone: string;
  college: string;
  company: string;
  source: 'LinkedIn' | 'WhatsApp' | 'Instagram' | 'Email' | 'Direct';
  ticketType: 'General Admission' | 'VIP Pass' | 'Student Discount';
  couponCode?: string;
  paymentStatus: 'Pending' | 'Paid' | 'Free';
  referralCode?: string;
  createdAt: Date;
  updatedAt: Date;
}

const registrationSchema = new Schema<IRegistration>(
  {
    eventId: {
      type: Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      trim: true,
      lowercase: true,
      index: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    college: {
      type: String,
      trim: true,
      default: '',
    },
    company: {
      type: String,
      trim: true,
      default: '',
    },
    source: {
      type: String,
      required: true,
      enum: ['LinkedIn', 'WhatsApp', 'Instagram', 'Email', 'Direct'],
    },
    ticketType: {
      type: String,
      required: true,
      enum: ['General Admission', 'VIP Pass', 'Student Discount'],
      default: 'General Admission',
    },
    couponCode: {
      type: String,
      trim: true,
      default: '',
    },
    paymentStatus: {
      type: String,
      required: true,
      enum: ['Pending', 'Paid', 'Free'],
      default: 'Free',
    },
    referralCode: {
      type: String,
      trim: true,
      default: '',
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to prevent duplicate registrations for the same event by email
registrationSchema.index({ eventId: 1, email: 1 }, { unique: true });

export const Registration = model<IRegistration>('Registration', registrationSchema);
