export interface Event {
  _id: string;
  title: string;
  slug: string;
  description: string;
  longDescription: string;
  date: string;
  category: 'Workshop' | 'Hackathon' | 'Seminar' | 'Webinar' | 'Bootcamp' | 'AI Meetup';
  location: string;
  mode: 'Offline' | 'Online' | 'Hybrid';
  availableSeats: number;
  registeredCount: number;
  speaker: string;
  duration: string;
  banner: string;
  createdAt: string;
  updatedAt: string;
}

export interface Registration {
  _id: string;
  eventId: string | Event;
  name: string;
  email: string;
  phone: string;
  college: string;
  company: string;
  source: 'LinkedIn' | 'WhatsApp' | 'Instagram' | 'Email' | 'Direct';
  createdAt: string;
  updatedAt: string;
}

export interface DashboardTotals {
  totalEvents: number;
  totalRegistrations: number;
  totalAvailableSeats: number;
  totalFilledSeats: number;
}

export interface RegistrationPerEvent {
  eventId: string;
  title: string;
  category: string;
  count: number;
}

export interface DashboardStats {
  totals: DashboardTotals;
  registrationsPerEvent: RegistrationPerEvent[];
  topEvents: Partial<Event>[];
  recentRegistrations: Registration[];
}
