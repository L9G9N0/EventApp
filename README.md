# BharatEvents 🚀 | Event Registration Mini Application

BharatEvents is a highly performant, responsive, and production-ready Full-Stack Event Registration application. Designed with a startup dashboard aesthetic, this application demonstrates professional design practices, robust API architectures, and bulletproof database integration.

The application allows users to discover upcoming tech and AI events across India's top tech hubs (Bengaluru, Noida, Gurugram, Delhi, Pune, Hyderabad, Mumbai, Chandigarh), view rich event details, register with built-in seat checks and double-booking protection, and provides an admin command centre featuring aggregated key performance metrics and searchable ledgers with CSV reports exporter.

---

## 🏗️ Architecture & Folder Structure

We follow a scalable monorepo-style structure, clearly separating the client-side Next.js application from the Node.js/Express.js REST backend.

```text
Event_App/
├── backend/                       # Express.js Server
│   ├── src/
│   │   ├── config/                # Mongoose Database Connection
│   │   │   └── db.ts
│   │   ├── models/                # Mongoose Schema Definitions
│   │   │   ├── event.model.ts
│   │   │   ├── registration.model.ts
│   │   │   └── analytics.model.ts
│   │   ├── controllers/           # API Request Controllers
│   │   │   ├── eventController.ts
│   │   │   ├── registrationController.ts
│   │   │   └── analyticsController.ts
│   │   ├── routes/                # Express API Route Mappings
│   │   │   ├── event.routes.ts
│   │   │   └── analytics.routes.ts
│   │   ├── middlewares/           # Global Middlewares
│   │   │   ├── error.middleware.ts
│   │   │   ├── rateLimiter.ts
│   │   │   └── validate.middleware.ts
│   │   ├── validators/            # Request Schemas (Zod validation)
│   │   │   └── validateRegistration.ts
│   │   ├── seed/                  # Database Initializer Script
│   │   │   └── seedEvents.ts
│   │   ├── utils/                 # General Utilities (AsyncWrapper, Loggers)
│   │   │   └── asyncWrapper.ts
│   │   └── server.ts              # Express Server Entry Point
│   ├── tsconfig.json
│   ├── package.json
│   └── .env
│
├── frontend/                      # Next.js Frontend (App Router)
│   ├── app/                       # Page Router and Layouts
│   │   ├── admin/dashboard/       # Protected Admin Command Centre
│   │   │   └── page.tsx
│   │   ├── events/[slug]/         # Detailed Event View & Registration Modal
│   │   │   └── page.tsx
│   │   ├── page.tsx               # Explore Events Listing Page
│   │   ├── layout.tsx             # Global HTML template and Providers wrapper
│   │   ├── globals.css            # CSS styling and Tailwind V4 definitions
│   │   ├── not-found.tsx          # Custom 404 handler
│   │   ├── error.tsx              # React Error Boundary
│   │   ├── sitemap.ts             # Dynamic search sitemap compiler
│   │   └── robots.txt             # Web crawler configuration
│   ├── components/                # Reusable UI Elements
│   │   ├── Navbar.tsx
│   │   ├── Footer.tsx
│   │   ├── Modal.tsx              # Reusable Slide-over Modal overlay
│   │   ├── ConfirmationDialog.tsx # Reusable double-confirm alerts
│   │   ├── EmptyState.tsx         # Clean zero-records states
│   │   ├── EventCardSkeleton.tsx  # Pulse skeleton loaders
│   │   └── QueryProvider.tsx      # React-Query Client Setup
│   ├── services/                  # Axios HTTP client requests
│   │   └── eventService.ts
│   ├── hooks/                     # Custom React Hooks
│   │   └── useDebounce.ts
│   ├── types/                     # Shared TypeScript interface definitions
│   │   └── index.ts
│   ├── analytics/                 # Frontend tracking utility
│   │   └── tracker.ts
│   ├── tsconfig.json
│   ├── package.json
│   └── next.config.ts
│
├── PDF_REQUIREMENTS.md            # Extracted technical requirements
├── README.md                      # Project documentation
└── .gitignore                     # Repository ignores config
```

---

## ⚡ Tech Stack

### Frontend
- **Framework:** Next.js (App Router, Version 16)
- **Language:** TypeScript
- **Styling:** Tailwind CSS V4
- **State Management & Fetching:** TanStack React Query (V5) & Axios
- **Form Management & Validation:** React Hook Form & Zod
- **Notifications:** React Hot Toast
- **Icons:** Lucide Icons
- **Animations:** Framer Motion (micro-animations on hover/transitions)

### Backend
- **Framework:** Node.js & Express.js
- **Database:** MongoDB (using Mongoose ODM)
- **Language:** TypeScript (using `ts-node-dev` for auto-reloading)
- **Validation:** Zod schemas
- **Security:** Helmet, Express Rate Limiter, CORS settings
- **Performance:** Compression middleware (Gzip), MongoDB indexing

---

## ⚙️ Environment Variables

Ensure you create `.env` files inside both directories to run the application in production/development:

### Backend Environment Variables (`backend/.env`)
```env
PORT=5001
MONGO_URI=mongodb://127.0.0.1:27017/event_registration_db
NODE_ENV=development
FRONTEND_URL=http://localhost:3000
```

### Frontend Environment Variables (`frontend/.env.local` or environment config)
```env
NEXT_PUBLIC_API_URL=http://localhost:5001
```

---

## 🚀 Quick Start Guide

### Prerequisites
1. **Node.js** (v18.0.0 or later recommended)
2. **MongoDB** community server running locally on port 27017 (or a MongoDB Atlas connection string configured in `MONGO_URI`).

---

### Step 1: Start MongoDB
If using macOS and installed via Homebrew:
```bash
brew services start mongodb-community
```

---

### Step 2: Set Up and Run Backend
1. Open a terminal and navigate to the backend:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Seed the database with 9 realistic events, 10 bookings, and sample logs:
   ```bash
   npm run seed
   ```
4. Start the development server (runs on port 5001):
   ```bash
   npm run dev
   ```

---

### Step 3: Set Up and Run Frontend
1. Open a new terminal and navigate to the frontend:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Next.js development server (runs on port 3000):
   ```bash
   npm run dev
   ```

---

## 🔌 API Documentation

All APIs are prefixed with `/api` and run on `http://localhost:5001`.

### Events Endpoint
#### 1. Fetch Events List
- **Route:** `GET /api/events`
- **Query Parameters:**
  - `search` (string) - Filters titles by keyword
  - `category` (string) - Filters category (`Workshop`, `Hackathon`, `Seminar`, `Webinar`, `Bootcamp`, `AI Meetup`)
  - `mode` (string) - Filters modes (`Offline`, `Online`, `Hybrid`)
  - `location` (string) - Filters city names
  - `page` (number) - Active page (default: 1)
  - `limit` (number) - Limits items per page (default: 8)
- **Response Format:**
  ```json
  {
    "success": true,
    "data": {
      "events": [...],
      "pagination": {
        "totalCount": 9,
        "totalPages": 2,
        "currentPage": 1,
        "limit": 8
      }
    }
  }
  ```

#### 2. Fetch Single Event
- **Route:** `GET /api/events/:id`
- **Parameters:** `:id` can be the Mongoose ObjectId or the event `slug`.
- **Response:** Returns the full event object.

#### 3. Create Event
- **Route:** `POST /api/events`
- **Body:** JSON representing the IEvent interface. Generates a unique slug dynamically.

#### 4. Register for an Event
- **Route:** `POST /api/events/:id/register`
- **Body:**
  ```json
  {
    "name": "Arjun Sharma",
    "email": "arjun.sharma@example.com",
    "phone": "9876543210",
    "college": "IIT Bombay",
    "company": "",
    "source": "LinkedIn"
  }
  ```
- **Error Handling:** 
  - Validates format using Zod (including Indian +91 phone check).
  - Returns `400 Bad Request` if event is fully booked (`availableSeats <= 0`).
  - Returns `400 Bad Request` if email is already registered for this event (prevented via Mongoose compound unique index `{ eventId: 1, email: 1 }`).

#### 5. Get Event Registrations
- **Route:** `GET /api/events/:id/registrations`
- **Response:** Returns list of registrations booked for the specified event.

---

### Analytics & Dashboard Endpoints
#### 1. Log Analytics Event
- **Route:** `POST /api/analytics/log`
- **Body:** `{ eventType, payload }`
- **Process:** Saves the event type, custom payload, client User-Agent, and client IP address to MongoDB.

#### 2. Get Dashboard Aggregates
- **Route:** `GET /api/analytics/dashboard`
- **Response:**
  ```json
  {
    "success": true,
    "data": {
      "totals": {
        "totalEvents": 9,
        "totalRegistrations": 10,
        "totalAvailableSeats": 1150,
        "totalFilledSeats": 10
      },
      "registrationsPerEvent": [
        { "eventId": "...", "title": "Next.js 15 Deep Dive", "count": 3 }
      ],
      "topEvents": [...],
      "recentRegistrations": [...]
    }
  }
  ```

#### 3. Search All Registrations
- **Route:** `GET /api/analytics/registrations`
- **Query Parameters:** `search` (keyword matches name, email, phone, company, college, or event titles).

---

## 📊 Analytics Documentation

We implement complete activity logging. Every tracking action triggers a browser console output and is saved to the MongoDB `AnalyticsLog` collection.

### Tracked Actions
1. `event_list_viewed`: Fired when listing page loads. Payload: `{ filterMode: 'client' | 'api' }`
2. `event_search_performed`: Fired when user types into the search bar (debounced). Payload: `{ query: string, source: 'home' | 'dashboard' }`
3. `event_filter_applied`: Fired when filters are adjusted. Payload: `{ filter: string, value: string }`
4. `event_card_clicked`: Fired when opening details. Payload: `{ eventId: string, eventName: string, category: string }`
5. `registration_submitted`: Fired when starting the registration request. Payload: `{ eventId, eventName }`
6. `registration_success`: Fired on booking success. Payload: `{ eventId, eventName, email }`
7. `registration_failed`: Fired on booking error. Payload: `{ eventId, eventName, errorMessage }`
8. `dashboard_opened`: Fired when admin signs in. Payload: `{ source: string }`
9. `dashboard_export_csv`: Fired when registrations table is exported. Payload: `{ count: number }`

---

## 🔑 Admin Dashboard Passphrase
To access the Admin dashboard `/admin/dashboard`, use the passphrase:
🔑 **`admin123`**

---

## 🛠️ Debugging & Known Issues

### 1. MongoDB Connection Failure
- **Issue:** Seeding or server start fails with `MongooseServerSelectionError: connect ECONNREFUSED 127.0.0.1:27017`.
- **Reason:** MongoDB daemon is not running on port 27017.
- **Resolution:** Verify MongoDB is active using `brew services list` or run it manually. If using a remote database, ensure the correct connection string is passed to `MONGO_URI`.

### 2. Race Conditions on Simultaneous Bookings
- **Design Resolution:** To prevent double bookings or seats dropping below zero during simultaneous requests, we implemented an atomic MongoDB query:
  `Event.findOneAndUpdate({ _id: id, availableSeats: { $gt: 0 } }, { $inc: { availableSeats: -1, registeredCount: 1 } })`
  If this atomic update returns null (meaning availableSeats was 0), we automatically delete the created registration and throw an error to rollback.

---

## 🤖 AI Assistance Note

This project was built with assistance from **Antigravity**, Google's agentic AI coding assistant.
### AI-Assisted Tasks:
1. **Folder Structures & Configurations:** Auto-generated scaffolding for Express.js with TypeScript support and Next.js Turbopack compiler.
2. **Atomic Seat Reductions:** Recommended the race-condition-free MongoDB `findOneAndUpdate` approach to guarantee accurate slot counts under heavy concurrency.
3. **TypeScript Definitions:** Mapped Mongoose document types to React TanStack Query objects for end-to-end type safety.
4. **CSV Serializer:** Assembled client-side UTF-8 CSV download functions.
5. **Interactive UI polish:** Provided layout guidelines for spacing, skeletons, and cards.

---
*Made with ❤️ by Hariom in Bengaluru.*
