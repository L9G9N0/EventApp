# Technical Assignment Requirements Audit 📋

This audit compares the Times Internet (Unstop) Technical Assessment PDF specifications against the current implementation.

---

## 1. Functional Requirements Matrix

| Requirement ID | PDF Description | Current Status | Notes / Polish |
| :--- | :--- | :--- | :--- |
| **REQ-1.1** | Event Listing Page - Display name, date, category, location/mode, description, available seats | **Implemented** | Renders dynamic cards with badges, difficulty, and ratings. |
| **REQ-1.2** | Search by Event Name | **Implemented** | Client-side debounced search and Server-side API parameter queries. |
| **REQ-1.3** | Filter by Category | **Implemented** | Dynamic category pills mapping list updates. |
| **REQ-1.4** | Filter by Location/Mode | **Implemented** | Drops and dropdown selectors supporting Indian cities and modes. |
| **REQ-2.1** | Client-Side Filtering | **Implemented** | Toggled via "Client Filter" button; updates state locally. |
| **REQ-2.2** | Server-Side Filtering | **Implemented** | Toggled via "API Filter" button; hits Express endpoint parameters. |
| **REQ-2.3** | Toggle Buttons for Filtering Mode | **Implemented** | Dual-switch action selector pill in header bar. |
| **REQ-3.1** | Event Details Page or Modal | **Implemented** | Implemented as dynamic route `/events/[slug]` and modal overlay. |
| **REQ-4.1** | Registration Form - Name, Email, Phone, College/Company, Source | **Implemented** | 3-step form wizard with Zod parsing. |
| **REQ-4.2** | Validation Rules - Valid Phone, Valid Email, Required Name | **Implemented** | Strict Regex for Indian mobile numbers and Zod checks. |
| **REQ-4.3** | Prevent Double Bookings (Same Email + Event) | **Implemented** | Blocked via database compound key and controller checks. |
| **REQ-4.4** | Block bookings if seats are full | **Implemented** | Checked atomically in controller update; rollbacks if capacity hit. |
| **REQ-5.1** | Backend APIs (`GET /api/events`, `GET /api/events/:id`, `POST /api/events`, `POST /api/events/:id/register`, `GET /api/events/:id/registrations`) | **Implemented** | Express routers mapped to separate controllers. |
| **REQ-6.1** | Basic Analytics Tracking (Log actions to console / MongoDB) | **Implemented** | Logged to console and persisted in `AnalyticsLogs` collection. |
| **REQ-6.2** | Payloads include event ID, event name, category | **Implemented** | Payloads sent via tracker client. |
| **REQ-7.1** | Admin Dashboard - Total events, total registrations, registrations per event, recent registrations | **Implemented** | Built admin dashboard on `/admin/dashboard`. |
| **REQ-8.1** | Seed Data (At least 8 events, 3 categories, 10 registrations) | **Implemented** | Seeds 100 events, 6 categories, 100 registrations, 350 logs. |

---

## 2. Advanced / Bonus Checklist

*   [x] **TypeScript Integration** (Strict typing configured on client and server).
*   [x] **Next.js App Router** (Dynamic routing structure, sitemaps, Turbopack).
*   [x] **Dashboard Access Protection** (Locked by passphrase `admin123`).
*   [x] **CSV Export** (Interactive ledger data download).
*   [x] **Clean Commits & Pushes** (15+ structural logs committed to GitHub).
*   [x] **SVG Analytical Charts** (Custom-made area paths, logs, funnels).
