# Changelog 📜

All notable changes to the **BharatEvents** project are documented in this file.

---

## [1.1.0] - 2026-07-08
### Added
*   **Startup-Grade Frontend**: Refactored the homepage and event details pages to match premium platforms like Luma and Unstop.
*   **Multi-step Booking Checkout Modal**: Integrated a 3-step checkout wizard with Zod validation, ticket tiers, and a `EARLYBIRD20` promo coupon code.
*   **SaaS Dashboard & SVG Charts**: Built custom responsive SVG area charts for registration trends, conversion funnel diagrams, and progress indicators.
*   **System Diagnostics**: Displays live MongoDB, Node, memory, and process uptime statistics.
*   **Analytics Logging**: Tracks user activity events like searches, filtering, bookmarks, shares, and registration failures.
*   **100 Events Seeder**: Upgraded seeder script to populate 100 events across 13 Indian cities, along with partners and sponsors.

---

## [1.0.0] - 2026-07-08
### Added
*   **Monorepo Core Setup**: Initialized workspace structures separating Next.js and Express folders.
*   **REST API Gateway**: Set up the Express backend with event listings, registration routes, Zod schemas, CORS, and rate limiters.
*   **Client Core UI**: Set up the Next.js frontend with TanStack Query integration, skeletons, and modular navigation components.
