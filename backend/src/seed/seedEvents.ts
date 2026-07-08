import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { Event } from '../models/event.model';
import { Registration } from '../models/registration.model';
import { AnalyticsLog, AnalyticsEventType } from '../models/analytics.model';

dotenv.config();

// Seeding configuration options
const CITIES = [
  'Bengaluru, Karnataka',
  'Noida, Uttar Pradesh',
  'Gurugram, Haryana',
  'Delhi, NCR',
  'Pune, Maharashtra',
  'Hyderabad, Telangana',
  'Mumbai, Maharashtra',
  'Chandigarh, Punjab',
  'Chennai, Tamil Nadu',
  'Jaipur, Rajasthan',
  'Kochi, Kerala',
  'Kolkata, West Bengal',
  'Ahmedabad, Gujarat'
];

const CATEGORIES = ['Workshop', 'Hackathon', 'Seminar', 'Webinar', 'Bootcamp', 'AI Meetup'] as const;

const SPEAKERS = [
  { name: 'Dr. Amit Sharma', title: 'Director of AI', company: 'TechCorp', image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=60' },
  { name: 'Rohan Verma', title: 'Principal Engineer', company: 'Zepto', image: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=60' },
  { name: 'Priya Mehta', title: 'VP Product', company: 'Razorpay', image: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=60' },
  { name: 'Sandeep Chaudhary', title: 'Founder', company: 'CodeCamp India', image: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&auto=format&fit=crop&q=60' },
  { name: 'Ananya Sen', title: 'Principal Designer', company: 'Zomato', image: 'https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&auto=format&fit=crop&q=60' },
  { name: 'Karthik Sundar', title: 'Developer Relations', company: 'Polygon', image: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=60' },
  { name: 'Harpreet Singh', title: 'Partner', company: 'PunjabVentures', image: 'https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&auto=format&fit=crop&q=60' },
  { name: 'Nilesh Patil', title: 'DevOps Architect', company: 'AWS Community', image: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=60' }
];

const COMPANIES = [
  { name: 'Razorpay', logo: 'https://images.unsplash.com/photo-1614680376593-902f74fa0d41?w=80&auto=format&fit=crop&q=60' },
  { name: 'Zomato', logo: 'https://images.unsplash.com/photo-1614680376739-414d95ff43df?w=80&auto=format&fit=crop&q=60' },
  { name: 'Zepto', logo: 'https://images.unsplash.com/photo-1611162617213-7d7a39e9b1d7?w=80&auto=format&fit=crop&q=60' },
  { name: 'Polygon', logo: 'https://images.unsplash.com/photo-1622630998477-20aa696ecb05?w=80&auto=format&fit=crop&q=60' },
  { name: 'Cred', logo: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=80&auto=format&fit=crop&q=60' },
  { name: 'Google Cloud', logo: 'https://images.unsplash.com/photo-1572021335469-31706a17aaef?w=80&auto=format&fit=crop&q=60' }
];

const TOPICS = [
  {
    title: 'React 19 & Next.js Advanced Patterns',
    desc: 'Deep dive into server actions, partial pre-rendering, and the new React compiler.',
    longDesc: 'Master client-side hydration, streaming HTML, rendering optimization, and architectural patterns of React 19. Learn to deploy serverless infrastructures and reduce layout shifting.',
    banners: 'https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=800&auto=format&fit=crop&q=60'
  },
  {
    title: 'Generative AI & LLM Agent Hackday',
    desc: 'Build, benchmark, and deploy autonomous LLM agents using vector databases.',
    longDesc: 'Work with LangChain, LlamaIndex, and vector databases like Milvus or Pinecone. We will cover Retrieval-Augmented Generation (RAG) pipelines, system evaluation, and prompt engineering.',
    banners: 'https://images.unsplash.com/photo-1677442136019-21780efad99a?w=800&auto=format&fit=crop&q=60'
  },
  {
    title: 'Fintech Security & UPI 3.0 Roundtable',
    desc: 'An exploration of scalable digital currency ledger integrations and payment gateways.',
    longDesc: 'Learn the architectural patterns behind payment settlements, ledger locks, transaction safety under high concurrency, and upcoming cross-border UPI transaction frameworks.',
    banners: 'https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?w=800&auto=format&fit=crop&q=60'
  },
  {
    title: 'Production Kubernetes & IaC Masterclass',
    desc: 'Architecting multi-region clusters with Terraform and GitOps practices.',
    longDesc: 'Manage massive traffic spikes using automated horizontal scaling. Topics include service meshes (Istio), Terraform state isolation, custom controllers, and Prometheus alerting.',
    banners: 'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&auto=format&fit=crop&q=60'
  },
  {
    title: 'UI/UX Advanced System Architecture',
    desc: 'Designing and publishing accessible, performant design systems for enterprise scale.',
    longDesc: 'A seminar detailing the creation of atomic components, design system packaging, WCAG 2.2 contrast compliance, and automatic UI visual testing pipelines.',
    banners: 'https://images.unsplash.com/photo-1581291518633-83b4ebd1d83e?w=800&auto=format&fit=crop&q=60'
  },
  {
    title: 'Blockchain Scaling & Zero Knowledge Proofs',
    desc: 'Decentralized application engineering using cryptographic rollups.',
    longDesc: 'Understand Rollup mechanics, Solidity smart contract optimization, gas fee reduction strategies, zk-SNARK integrations, and multi-signature security practices.',
    banners: 'https://images.unsplash.com/photo-1639762681485-074b7f938ba0?w=800&auto=format&fit=crop&q=60'
  }
];

const FIRST_NAMES = ['Aarav', 'Aditi', 'Rohan', 'Priya', 'Karan', 'Nisha', 'Siddharth', 'Meera', 'Vikram', 'Ananya', 'Rahul', 'Neha', 'Amit', 'Pooja', 'Sandeep', 'Kriti', 'Rajesh', 'Jyoti', 'Harpreet', 'Shreya'];
const LAST_NAMES = ['Sharma', 'Verma', 'Gupta', 'Malhotra', 'Iyer', 'Patil', 'Reddy', 'Singh', 'Nair', 'Joshi', 'Chaudhary', 'Patel', 'Kumar', 'Das'];

const seedData = async () => {
  try {
    const mongoUri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/event_registration_db';
    console.log('Starting heavy database seeding (100 Events + 100 registrations + analytics logs)...');
    await mongoose.connect(mongoUri);

    // 1. Wipe collections
    await Event.deleteMany({});
    await Registration.deleteMany({});
    await AnalyticsLog.deleteMany({});
    console.log('Database wiped.');

    // 2. Generate 100 Rich Events
    const eventsToInsert = [];
    const now = new Date();

    for (let i = 1; i <= 100; i++) {
      const topic = TOPICS[i % TOPICS.length];
      const speaker = SPEAKERS[i % SPEAKERS.length];
      const company = COMPANIES[i % COMPANIES.length];
      const category = CATEGORIES[i % CATEGORIES.length];
      
      const cityString = CITIES[i % CITIES.length];
      const isOnline = category === 'Webinar' || i % 7 === 0;
      const mode = isOnline ? 'Online' : (i % 5 === 0 ? 'Hybrid' : 'Offline');
      const location = isOnline ? 'Zoom Meetings Live' : `${cityString}, Tech Park Sector ${i}`;
      
      const title = `${topic.title} - Batch #${Math.ceil(i / TOPICS.length)}`;
      const baseSlug = title
        .toLowerCase()
        .trim()
        .replace(/[^\w\s-]/g, '')
        .replace(/[\s_-]+/g, '-')
        .replace(/^-+|-+$/g, '');
      const slug = `${baseSlug}-${i}`;

      // Date: offset in future from 2 to 120 days
      const date = new Date(now.getTime() + (2 + (i % 120)) * 24 * 60 * 60 * 1000);
      
      // Price structure (some free, some paid)
      const price = i % 3 === 0 ? 499 : (i % 5 === 0 ? 1299 : 0);
      const difficulty = i % 3 === 0 ? 'Advanced' : (i % 2 === 0 ? 'Intermediate' : 'Beginner');

      const requirements = [
        'Basic familiarity with programming principles',
        difficulty !== 'Beginner' ? 'Experience working with REST APIs and variables' : 'Laptop and a GitHub account',
        difficulty === 'Advanced' ? 'Prior production deployment experience recommended' : 'Internet browser installed'
      ].filter(Boolean);

      const agenda = [
        { time: '09:30 AM', title: 'Registrations & Morning Brew', description: 'Collect tags, settle down, and network with early attendees.' },
        { time: '10:00 AM', title: 'Keynote & Initial Deep Dive', description: 'Opening statements and fundamental block breakdowns.' },
        { time: '12:30 PM', title: 'Midday Lunch Break', description: 'Complimentary lunch buffet provided for all on-site registers.' },
        { time: '01:30 PM', title: 'Hands-on Labs & Build Session', description: 'Coding together, debugging in groups, and testing live deployments.' }
      ];

      const faqs = [
        { question: 'Is this event suitable for students?', answer: 'Yes, students are welcome. We recommend having a laptop for hands-on segments.' },
        { question: 'Will certificates be provided?', answer: 'Yes, all attendees will receive a certificate of completion via email within 48 hours.' },
        { question: 'What is the refund policy for tickets?', answer: 'Paid registrations are refundable up to 24 hours prior to the event start time.' }
      ];

      const sponsors = [
        { name: company.name, logo: company.logo },
        { name: 'GitHub India', logo: 'https://images.unsplash.com/photo-1618401471353-b98aedd07871?w=80&auto=format&fit=crop&q=60' }
      ];

      eventsToInsert.push({
        title,
        slug,
        description: topic.desc,
        longDescription: topic.longDesc,
        date,
        category,
        location,
        mode,
        availableSeats: 50 + (i % 150),
        registeredCount: 0,
        speaker: speaker.name,
        speakerImage: speaker.image,
        speakerTitle: `${speaker.title} at ${speaker.company}`,
        duration: i % 4 === 0 ? '1 Day' : '4 Hours',
        banner: topic.banners,
        organizer: `India Dev Circle (${cityString.split(',')[0]})`,
        company: company.name,
        companyLogo: company.logo,
        rating: +(4.3 + (i % 7) * 0.1).toFixed(1),
        reviewsCount: 15 + (i * 3),
        price,
        difficulty,
        expectedAudience: i % 2 === 0 ? 'Developers & Architects' : 'Tech Enthusiasts & Students',
        requirements,
        agenda,
        faqs,
        sponsors
      });
    }

    const createdEvents = await Event.insertMany(eventsToInsert);
    console.log(`Successfully seeded ${createdEvents.length} events.`);

    // 3. Generate 1000 Registrations spread across events
    const registrationsToInsert = [];
    const sourceTypes = ['LinkedIn', 'WhatsApp', 'Instagram', 'Email', 'Direct'] as const;
    const ticketTypes = ['General Admission', 'VIP Pass', 'Student Discount'] as const;

    for (let k = 0; k < 1000; k++) {
      const firstName = FIRST_NAMES[k % FIRST_NAMES.length];
      const lastName = LAST_NAMES[k % LAST_NAMES.length];
      const name = `${firstName} ${lastName}`;
      const email = `${firstName.toLowerCase()}.${lastName.toLowerCase()}${k}@example.com`;
      const phone = `${7 + (k % 3)}${Math.floor(100000000 + Math.random() * 900000000)}`; // 10 digit Indian number
      
      const targetEvent = createdEvents[k % createdEvents.length];
      const source = sourceTypes[k % sourceTypes.length];
      const ticketType = ticketTypes[k % ticketTypes.length];
      
      const college = k % 2 === 0 ? `University of ${CITIES[k % CITIES.length].split(',')[0]}` : '';
      const company = k % 2 !== 0 ? `${COMPANIES[k % COMPANIES.length].name} Solutions` : '';

      registrationsToInsert.push({
        eventId: targetEvent._id,
        name,
        email,
        phone,
        college,
        company,
        source,
        ticketType,
        couponCode: k % 4 === 0 ? 'EARLYBIRD20' : '',
        paymentStatus: targetEvent.price === 0 ? 'Free' : (k % 3 === 0 ? 'Paid' : 'Pending'),
        referralCode: k % 5 === 0 ? `REF-${k}X` : '',
        createdAt: new Date(now.getTime() - (k % 10) * 24 * 60 * 60 * 1000) // spread registration dates
      });

      // Update seats on event
      await Event.findByIdAndUpdate(targetEvent._id, {
        $inc: { availableSeats: -1, registeredCount: 1 }
      });
    }

    await Registration.insertMany(registrationsToInsert);
    console.log(`Successfully seeded 1000 registrations.`);

    // 4. Generate 600 Analytics Logs
    const analyticsLogs = [];
    const logTypes: { type: AnalyticsEventType; payloadGen: (evt: any) => any }[] = [
      { type: 'event_list_viewed', payloadGen: () => ({ filterMode: 'api' }) },
      { type: 'event_list_viewed', payloadGen: () => ({ filterMode: 'client' }) },
      { type: 'event_search_performed', payloadGen: () => ({ query: 'React', source: 'home' }) },
      { type: 'event_search_performed', payloadGen: () => ({ query: 'AI', source: 'home' }) },
      { type: 'event_filter_applied', payloadGen: () => ({ filter: 'category', value: 'Workshop' }) },
      { type: 'event_filter_applied', payloadGen: () => ({ filter: 'location', value: 'Bengaluru' }) },
      { type: 'event_card_clicked', payloadGen: (evt) => ({ eventId: evt._id, eventName: evt.title, category: evt.category }) },
      { type: 'registration_submitted', payloadGen: (evt) => ({ eventId: evt._id, eventName: evt.title }) },
      { type: 'registration_success', payloadGen: (evt) => ({ eventId: evt._id, eventName: evt.title, email: 'user@example.com' }) },
      { type: 'dashboard_opened', payloadGen: () => ({ source: 'direct' }) },
      { type: 'dashboard_export_csv', payloadGen: () => ({ count: 1000 }) }
    ];

    for (let j = 0; j < 600; j++) {
      const logInfo = logTypes[j % logTypes.length];
      const targetEvent = createdEvents[j % createdEvents.length];
      
      analyticsLogs.push({
        eventType: logInfo.type,
        payload: logInfo.payloadGen(targetEvent),
        userAgent: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36',
        ipAddress: `192.168.1.${10 + (j % 50)}`,
        createdAt: new Date(now.getTime() - (j % 15) * 24 * 60 * 60 * 1000) // Spread over 15 days
      });
    }

    await AnalyticsLog.insertMany(analyticsLogs);
    console.log(`Successfully seeded ${analyticsLogs.length} analytics events.`);

    console.log('Seeder process finished successfully!');
    process.exit(0);
  } catch (error) {
    console.error('Seeder process failed:', error);
    process.exit(1);
  }
};

seedData();
