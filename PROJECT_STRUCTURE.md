# Project Structure Directory 🗂️

This document details the file structures and layouts inside **BharatEvents**.

---

## 1. Directory Tree Map

```text
Event_App/
├── backend/                       # Express.js REST API
│   ├── src/
│   │   ├── config/                # Database and Redis initializers
│   │   │   └── db.ts              # MongoDB Connection via Mongoose
│   │   ├── models/                # Database Model Schemas
│   │   │   ├── event.model.ts     # Rich Event Fields (Agendas, Sponsors)
│   │   │   ├── registration.model.ts # Ticket details, payment status
│   │   │   └── analytics.model.ts # Activity logs schema
│   │   ├── controllers/           # Endpoint handlers
│   │   │   ├── eventController.ts
│   │   │   ├── registrationController.ts
│   │   │   └── analyticsController.ts
│   │   ├── routes/                # Express Route Maps
│   │   │   ├── event.routes.ts
│   │   │   └── analytics.routes.ts
│   │   ├── middlewares/           # Middlewares (Rate limit, errors)
│   │   │   ├── error.middleware.ts
│   │   │   ├── rateLimiter.ts
│   │   │   └── validate.middleware.ts
│   │   ├── validators/            # Request Schemas (Zod validation)
│   │   │   └── validateRegistration.ts
│   │   ├── seed/                  # Seeder Script (seeds 100+ events)
│   │   │   └── seedEvents.ts
│   │   ├── utils/                 # Utilities
│   │   │   └── asyncWrapper.ts    # Catches route promise errors
│   │   └── server.ts              # Express Server Entry Point
│   ├── tsconfig.json              # Backend TypeScript setup
│   └── package.json
│
├── frontend/                      # Next.js SPA
│   ├── app/                       # App Router Directories
│   │   ├── admin/dashboard/       # Protected Dashboard Layout
│   │   │   └── page.tsx
│   │   ├── events/[slug]/         # Detailed landing & multi-step checkout
│   │   │   └── page.tsx
│   │   ├── page.tsx               # Homepage Listing
│   │   ├── layout.tsx             # Theme structure and provider wraps
│   │   ├── globals.css            # Stylesheets & Tailwind theme configs
│   │   ├── not-found.tsx          # Custom 404 handler
│   │   ├── error.tsx              # Error boundary
│   │   ├── sitemap.ts             # Dynamic search sitemap compiler
│   │   └── robots.txt             # Web crawler configuration
│   ├── components/                # Modular client elements
│   │   ├── Navbar.tsx
│   │   ├── Footer.tsx
│   │   ├── Modal.tsx              # Reusable modal overlays
│   │   ├── ConfirmationDialog.tsx # Double confirm popup alert
│   │   ├── EmptyState.tsx         # Clean zero search displays
│   │   ├── EventCardSkeleton.tsx  # Pulse skeleton blocks
│   │   └── QueryProvider.tsx      # React-Query Client Setup
│   ├── services/                  # Axios HTTP client requests
│   │   └── eventService.ts
│   ├── hooks/                     # Custom React Hooks
│   │   └── useDebounce.ts         # Handles search field input delays
│   ├── types/                     # Shared TypeScript interfaces
│   │   └── index.ts
│   ├── analytics/                 # Tracker utility client
│   │   └── tracker.ts
│   ├── tsconfig.json              # Frontend TypeScript setup
│   └── package.json
│
└── package.json                   # Root package runner shortcuts
```

---

## 2. Structural Patterns

1.  **Backend Controllers & Routes**: Separation of route mapping (`routes/*.ts`) and execution logic (`controllers/*.ts`).
2.  **Validators**: Independent schema parsing (`validators/*.ts`) run prior to routing execution.
3.  **Frontend app/ folder**: App Router folders representing views containing a singular `page.tsx` file for simplicity.
4.  **Static Site optimizations**: Meta tag configuration models inside layout files and robots definitions are mapped at root pages.
