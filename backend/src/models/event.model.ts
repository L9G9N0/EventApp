import { Schema, model, Document } from 'mongoose';

export interface IEvent extends Document {
  title: string;
  slug: string;
  description: string;
  longDescription: string;
  date: Date;
  category: 'Workshop' | 'Hackathon' | 'Seminar' | 'Webinar' | 'Bootcamp' | 'AI Meetup';
  location: string;
  mode: 'Offline' | 'Online' | 'Hybrid';
  availableSeats: number;
  registeredCount: number;
  speaker: string;
  duration: string;
  banner: string;
  createdAt: Date;
  updatedAt: Date;
}

const eventSchema = new Schema<IEvent>(
  {
    title: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, index: true, trim: true },
    description: { type: String, required: true },
    longDescription: { type: String, required: true },
    date: { type: Date, required: true },
    category: {
      type: String,
      required: true,
      enum: ['Workshop', 'Hackathon', 'Seminar', 'Webinar', 'Bootcamp', 'AI Meetup'],
    },
    location: { type: String, required: true },
    mode: {
      type: String,
      required: true,
      enum: ['Offline', 'Online', 'Hybrid'],
    },
    availableSeats: { type: Number, required: true, min: 0 },
    registeredCount: { type: Number, required: true, default: 0, min: 0 },
    speaker: { type: String, required: true },
    duration: { type: String, required: true },
    banner: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

export const Event = model<IEvent>('Event', eventSchema);
