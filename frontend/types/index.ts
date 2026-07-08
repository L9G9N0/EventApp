export interface AgendaItem {
  time: string;
  title: string;
  description: string;
}

export interface Sponsor {
  name: string;
  logo: string;
}

export interface FaqItem {
  question: string;
  answer: string;
}

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
  speakerImage: string;
  speakerTitle: string;
  duration: string;
  banner: string;
  organizer: string;
  company: string;
  companyLogo: string;
  rating: number;
  reviewsCount: number;
  price: number;
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  expectedAudience: string;
  requirements: string[];
  agenda: AgendaItem[];
  faqs: FaqItem[];
  sponsors: Sponsor[];
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
  ticketType: 'General Admission' | 'VIP Pass' | 'Student Discount';
  couponCode?: string;
  paymentStatus: 'Pending' | 'Paid' | 'Free';
  referralCode?: string;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardTotals {
  totalEvents: number;
  totalRegistrations: number;
  totalAvailableSeats: number;
  totalFilledSeats: number;
  totalRevenue: number;
}

export interface RegistrationPerEvent {
  eventId: string;
  title: string;
  category: string;
  count: number;
}

export interface DailyTrend {
  date: string;
  count: number;
}

export interface SourceDistribution {
  source: string;
  count: number;
}

export interface CityDistribution {
  city: string;
  count: number;
}

export interface CategoryDistribution {
  category: string;
  count: number;
}

export interface FunnelStats {
  views: number;
  clicks: number;
  submissions: number;
  successes: number;
}

export interface SystemHealth {
  mongodb: string;
  nodeVersion: string;
  memory: string;
  uptime: string;
}

export interface DashboardStats {
  totals: DashboardTotals;
  registrationsPerEvent: RegistrationPerEvent[];
  topEvents: Partial<Event>[];
  recentRegistrations: Registration[];
  registrationTrends: DailyTrend[];
  referralStats: SourceDistribution[];
  cityStats: CityDistribution[];
  categoryStats: CategoryDistribution[];
  funnel: FunnelStats;
  systemHealth: SystemHealth;
}
