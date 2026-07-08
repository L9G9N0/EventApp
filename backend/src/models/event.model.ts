import { Schema, model, Document } from 'mongoose';

export interface IAgendaItem {
  time: string;
  title: string;
  description: string;
}

export interface ISponsor {
  name: string;
  logo: string;
}

export interface IFaqItem {
  question: string;
  answer: string;
}

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
  speakerImage: string;
  speakerTitle: string;
  duration: string;
  banner: string;
  organizer: string;
  company: string;
  companyLogo: string;
  rating: number;
  reviewsCount: number;
  price: number; // 0 for Free
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  expectedAudience: string;
  requirements: string[];
  agenda: IAgendaItem[];
  faqs: IFaqItem[];
  sponsors: ISponsor[];
  createdAt: Date;
  updatedAt: Date;
}

const agendaSchema = new Schema<IAgendaItem>({
  time: { type: String, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
});

const sponsorSchema = new Schema<ISponsor>({
  name: { type: String, required: true },
  logo: { type: String, required: true },
});

const faqSchema = new Schema<IFaqItem>({
  question: { type: String, required: true },
  answer: { type: String, required: true },
});

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
    speakerImage: { type: String, required: true },
    speakerTitle: { type: String, required: true },
    duration: { type: String, required: true },
    banner: { type: String, required: true },
    organizer: { type: String, required: true, default: 'BharatEvents' },
    company: { type: String, required: true, default: 'Tech Startup' },
    companyLogo: { type: String, required: true },
    rating: { type: Number, required: true, default: 4.8, min: 0, max: 5 },
    reviewsCount: { type: Number, required: true, default: 45 },
    price: { type: Number, required: true, default: 0 },
    difficulty: {
      type: String,
      required: true,
      enum: ['Beginner', 'Intermediate', 'Advanced'],
      default: 'Beginner',
    },
    expectedAudience: { type: String, required: true },
    requirements: { type: [String], default: [] },
    agenda: { type: [agendaSchema], default: [] },
    faqs: { type: [faqSchema], default: [] },
    sponsors: { type: [sponsorSchema], default: [] },
  },
  {
    timestamps: true,
  }
);

export const Event = model<IEvent>('Event', eventSchema);
