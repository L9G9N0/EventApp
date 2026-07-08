import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Event, IEvent } from '../models/event.model';
import { Registration } from '../models/registration.model';
import { AnalyticsLog } from '../models/analytics.model';

dotenv.config();

const sampleEvents = [
  {
    title: 'India GenAI Builders Summit 2026',
    slug: 'india-genai-builders-summit-2026',
    description: 'The largest gathering of generative AI engineers and builders in Silicon Valley of India.',
    longDescription: 'Join us for an action-packed day of deep-tech talks, panel discussions, and hands-on workshops focused on building production-ready LLM agents, scaling vector databases, and optimizing open-source foundation models. Network with top researchers, startup founders, and engineers from across the country.',
    date: new Date('2026-08-15T09:30:00Z'),
    category: 'AI Meetup',
    location: 'Bengaluru, HSR Layout Sector 4',
    mode: 'Offline',
    availableSeats: 120,
    registeredCount: 0,
    speaker: 'Dr. Amit Sharma (Director of AI, TechCorp)',
    duration: '8 Hours',
    banner: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?w=800&auto=format&fit=crop&q=60',
  },
  {
    title: 'Next.js 15 Server Components Deep Dive',
    slug: 'nextjs-15-server-components-deep-dive',
    description: 'Master React Server Components, Server Actions, and partial pre-rendering in Next.js 15.',
    longDescription: 'A comprehensive, hands-on workshop led by industry veterans. Learn how to architect lightning-fast applications using Next.js 15 App Router. We will cover server components vs client components, caching strategies, optimistic UI updates, dynamic database rendering, and production deployment optimization on Vercel.',
    date: new Date('2026-09-02T14:00:00Z'),
    category: 'Workshop',
    location: 'Noida, Sector 62',
    mode: 'Hybrid',
    availableSeats: 50,
    registeredCount: 0,
    speaker: 'Rohan Verma (Senior Frontend Engineer, Zepto)',
    duration: '4 Hours',
    banner: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?w=800&auto=format&fit=crop&q=60',
  },
  {
    title: 'Delhi National Web3 Hackathon',
    slug: 'delhi-national-web3-hackathon',
    description: 'Code the decentralized future and win prizes up to ₹5,00,000.',
    longDescription: 'Delhi NCR\'s premier hackathon is back! Work solo or in teams of up to 4 to build innovative solutions on Ethereum, Solana, and Layer 2s. Mentors from top web3 startups will be on-site to guide you. Food, drinks, and cool swag are on us. Ready to build the next unicorn?',
    date: new Date('2026-10-10T10:00:00Z'),
    category: 'Hackathon',
    location: 'Delhi, Pragati Maidan',
    mode: 'Offline',
    availableSeats: 250,
    registeredCount: 0,
    speaker: 'Vikram Malhotra & Team (Founders, BlockScale)',
    duration: '3 Days',
    banner: 'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&auto=format&fit=crop&q=60',
  },
  {
    title: 'Fintech Revolution and UPI 2.0 Seminar',
    slug: 'fintech-revolution-and-upi-seminar',
    description: 'An exclusive panel session on the future of digital payments, credit cards, and cross-border UPI.',
    longDescription: 'Explore how fintech is reshaping the banking landscape in India. We will discuss UPI integration with credit cards, automated lending systems, CBDC (Digital Rupee) implementation, and security challenges in payment gateway integrations. Perfect for fintech product managers and builders.',
    date: new Date('2026-08-28T16:00:00Z'),
    category: 'Seminar',
    location: 'Mumbai, BKC Complex',
    mode: 'Offline',
    availableSeats: 80,
    registeredCount: 0,
    speaker: 'Priya Mehta (VP Product, BharatPay)',
    duration: '3 Hours',
    banner: 'https://images.unsplash.com/photo-1556761175-4b46a572b786?w=800&auto=format&fit=crop&q=60',
  },
  {
    title: 'Scale and Design Systems Webinar',
    slug: 'scale-and-design-systems-webinar',
    description: 'Learn how to build reusable, accessible, and performant design systems for enterprise scale.',
    longDescription: 'In this webinar, we will explore the strategies used to manage UI systems across hundreds of developers. We will talk about styling tokens, atomic component structures, WAI-ARIA accessibility compliance, package versioning, and automated UI regression testing.',
    date: new Date('2026-09-12T11:00:00Z'),
    category: 'Webinar',
    location: 'Zoom Meetings',
    mode: 'Online',
    availableSeats: 500,
    registeredCount: 0,
    speaker: 'Ananya Sen (Principal Designer, Razorpay)',
    duration: '2 Hours',
    banner: 'https://images.unsplash.com/photo-1591115413009-d621367f18e5?w=800&auto=format&fit=crop&q=60',
  },
  {
    title: 'Full-Stack Dev Bootcamp: Zero to One',
    slug: 'full-stack-dev-bootcamp-zero-to-one',
    description: 'A 6-week intensive bootcamp to level up your engineering skills.',
    longDescription: 'Become a highly paid, production-ready full-stack developer. Learn advanced React, Next.js, Node.js/Express, MongoDB indexing, Docker deployment, and CI/CD pipelines. This includes 1-on-1 mentorship, weekly code reviews, and mock interview preparations.',
    date: new Date('2026-11-01T09:00:00Z'),
    category: 'Bootcamp',
    location: 'Gurugram, Cyber City Phase II',
    mode: 'Hybrid',
    availableSeats: 30,
    registeredCount: 0,
    speaker: 'Sandeep Chaudhary (Founder, CodeCamp India)',
    duration: '6 Weeks',
    banner: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?w=800&auto=format&fit=crop&q=60',
  },
  {
    title: 'Pune Cloud & DevOps Engineering Meetup',
    slug: 'pune-cloud-devops-meetup',
    description: 'Discussing Kubernetes scaling, Terraform state management, and serverless architectures.',
    longDescription: 'Meet up with fellow system administrators, DevOps engineers, and cloud architects in Pune. We will have technical talks on running stateful sets in Kubernetes, Infrastructure as Code workflows, cost optimization on AWS/GCP, and logging/observability using Prometheus & Grafana.',
    date: new Date('2026-09-20T17:30:00Z'),
    category: 'AI Meetup',
    location: 'Pune, Hinjewadi IT Park Phase 1',
    mode: 'Offline',
    availableSeats: 60,
    registeredCount: 0,
    speaker: 'Nilesh Patil (DevOps Lead, CloudScale)',
    duration: '3.5 Hours',
    banner: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?w=800&auto=format&fit=crop&q=60',
  },
  {
    title: 'Hyderabad UX/UI Advanced Masterclass',
    slug: 'hyderabad-uxui-advanced-masterclass',
    description: 'Deep dive into user research, wireframing, and interactive prototyping.',
    longDescription: 'A practical, interactive workshop focusing on modern interface design. Learn how to translate user pain points into elegant interfaces, run usability tests, and build high-fidelity interactive prototypes in Figma. Attendees will receive a certificate of completion.',
    date: new Date('2026-08-05T10:00:00Z'),
    category: 'Workshop',
    location: 'Hyderabad, Gachibowli Financial District',
    mode: 'Hybrid',
    availableSeats: 40,
    registeredCount: 0,
    speaker: 'Rajesh Goud (Design Consultant)',
    duration: '1 Day',
    banner: 'https://images.unsplash.com/photo-1531482615713-2afd69097998?w=800&auto=format&fit=crop&q=60',
  },
  {
    title: 'Chandigarh Tech Startup Pitch and Networking',
    slug: 'chandigarh-tech-startup-pitch',
    description: 'Pitch your startup ideas to VCs and connect with co-founders.',
    longDescription: 'Are you building a tech startup in Punjab/Chandigarh? Present your startup MVP to active seed-stage investors, receive direct feedback, and network with fellow programmers and creators. Find your next investor or developer!',
    date: new Date('2026-08-20T15:00:00Z'),
    category: 'Seminar',
    location: 'Chandigarh, Sector 17',
    mode: 'Offline',
    availableSeats: 100,
    registeredCount: 0,
    speaker: 'Harpreet Singh (Managing Partner, PunjabVentures)',
    duration: '3 Hours',
    banner: 'https://images.unsplash.com/photo-1517048676732-d65bc937f952?w=800&auto=format&fit=crop&q=60',
  },
];

const sampleRegistrations = [
  { name: 'Aarav Sharma', email: 'aarav.sharma@gmail.com', phone: '9876543210', college: 'IIT Delhi', company: '', source: 'LinkedIn' },
  { name: 'Aditi Verma', email: 'aditi.verma@yahoo.com', phone: '8765432109', college: 'NSUT Delhi', company: '', source: 'WhatsApp' },
  { name: 'Rohan Gupta', email: 'rohan.g@tcs.com', phone: '7654321098', college: '', company: 'TCS Noida', source: 'Direct' },
  { name: 'Karan Malhotra', email: 'karan.m@gmail.com', phone: '9123456789', college: 'DTU Delhi', company: '', source: 'Instagram' },
  { name: 'Priya Iyer', email: 'priya.iyer@microsoft.com', phone: '8234567890', college: '', company: 'Microsoft Bengaluru', source: 'LinkedIn' },
  { name: 'Siddharth Patil', email: 'sid.patil@outlook.com', phone: '7345678901', college: 'COEP Pune', company: '', source: 'Email' },
  { name: 'Nisha Reddy', email: 'nisha.r@gmail.com', phone: '9456789012', college: 'IIIT Hyderabad', company: '', source: 'WhatsApp' },
  { name: 'Arjun Singh', email: 'arjun.s@infosys.com', phone: '8567890123', college: '', company: 'Infosys Chandigarh', source: 'LinkedIn' },
  { name: 'Meera Nair', email: 'meera.n@gmail.com', phone: '7678901234', college: 'PES University', company: '', source: 'Direct' },
  { name: 'Vikram Joshi', email: 'vikram.j@gmail.com', phone: '6789012345', college: 'BITS Pilani', company: '', source: 'Instagram' },
];

const sampleAnalyticsLogs = [
  { eventType: 'dashboard_opened', payload: {} },
  { eventType: 'event_list_viewed', payload: { category: 'All', mode: 'All' } },
  { eventType: 'event_search_performed', payload: { query: 'Next.js' } },
  { eventType: 'event_filter_applied', payload: { filter: 'category', value: 'Workshop' } },
  { eventType: 'event_card_clicked', payload: { slug: 'nextjs-15-server-components-deep-dive' } },
  { eventType: 'registration_submitted', payload: { slug: 'nextjs-15-server-components-deep-dive' } },
  { eventType: 'registration_success', payload: { email: 'aarav.sharma@gmail.com', slug: 'nextjs-15-server-components-deep-dive' } },
  { eventType: 'dashboard_export_csv', payload: {} },
];

const seedData = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/event_registration_db';
    console.log('Seeding database...');
    await mongoose.connect(mongoUri);

    // 1. Clear existing data
    await Event.deleteMany({});
    await Registration.deleteMany({});
    await AnalyticsLog.deleteMany({});
    console.log('Cleared existing data.');

    // 2. Insert Events
    const createdEvents = await Event.insertMany(sampleEvents);
    console.log(`Inserted ${createdEvents.length} events.`);

    // 3. Insert Registrations & update corresponding Event seat numbers
    // Let's distribute registrations across events
    for (let i = 0; i < sampleRegistrations.length; i++) {
      const reg = sampleRegistrations[i];
      // Distribute registrations: Event index = i % eventCount
      const targetEvent = createdEvents[i % createdEvents.length];
      
      const newReg = new Registration({
        ...reg,
        eventId: targetEvent._id,
      });

      await newReg.save();

      // Decrement seats and increment registrations count on Event
      await Event.findByIdAndUpdate(targetEvent._id, {
        $inc: { availableSeats: -1, registeredCount: 1 },
      });
    }
    console.log(`Inserted ${sampleRegistrations.length} registrations and updated event seat counts.`);

    // 4. Insert Analytics Logs
    // Enrich analytics logs with actual event data
    const enrichedLogs = (sampleAnalyticsLogs as any[]).map((log) => {
      const payloadCopy = { ...log.payload };
      if (payloadCopy.slug) {
        const found = createdEvents.find((e) => e.slug === payloadCopy.slug);
        if (found) {
          payloadCopy.eventId = found._id;
          payloadCopy.eventName = found.title;
          payloadCopy.category = found.category;
        }
      }
      return {
        ...log,
        payload: payloadCopy,
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        ipAddress: '127.0.0.1',
      };
    });

    await AnalyticsLog.insertMany(enrichedLogs);
    console.log(`Inserted ${enrichedLogs.length} analytics events.`);

    console.log('Database Seeding Completed Successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  }
};

seedData();
