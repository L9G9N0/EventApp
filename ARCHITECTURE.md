# Architecture Blueprint 🏗️

This document outlines the system architecture, database relations, and engineering decisions implemented in **BharatEvents**.

---

## 1. High-Level Architectural Flow

BharatEvents is architected as a decoupled, monorepo-style system:

```mermaid
graph TD
    Client[Next.js App Router Client]
    Express[Express.js Node API]
    Mongo[(MongoDB Database)]

    Client -->|Axios JSON Payloads| Express
    Express -->|Mongoose Queries| Mongo
```

---

## 2. Component Hierarchies

### Frontend Page Routing
Next.js utilizes dynamic file-based routing:
*   `/` (Explore Listings)
*   `/events/[slug]` (Dynamic details & registration wizard)
*   `/admin/dashboard` (Passphrase locked stats, SVGs, ledger)

### Reusable UI Layer
*   **QueryProvider**: Standardizes TanStack Query configurations across client trees.
*   **Navbar & Footer**: Standardized navigation layouts.
*   **Modal**: Lock scroll viewport, overlay backgrounds, and exit animations.
*   **EventCardSkeleton**: Tailwind pulse loaders showing skeleton layouts during API loads.
*   **EmptyState**: Visual graphics prompting filter resets.

---

## 3. Concurrency & Race-Condition Guards

To prevent overallocating seats during high-traffic bookings, we implemented an atomic seat guard:

```mermaid
stateDiagram-v2
    [*] --> CheckAvailability : Registration form submitted
    CheckAvailability --> BlockUser : Seats <= 0
    CheckAvailability --> AtomicReserve : Seats > 0
    
    state AtomicReserve {
        [*] --> RunFindOneAndUpdate
        RunFindOneAndUpdate --> DecAvailableIncFilled : availableSeats > 0
        RunFindOneAndUpdate --> ReturnNull : availableSeats <= 0
    }
    
    AtomicReserve --> SaveRegistration : Success (Return Updated Event)
    AtomicReserve --> RollbackRegistration : Failure (Return Null)
    
    SaveRegistration --> [*] : Render Invoice (Step 4)
    RollbackRegistration --> [*] : Delete Registration Doc & Show Error
```

1.  **Zod validation**: Express parses requests using Zod schemas.
2.  **Duplicate check**: Queries unique registration entries to reject duplicate submissions.
3.  **Atomic Update**:
    ```typescript
    const updatedEvent = await Event.findOneAndUpdate(
      { _id: id, availableSeats: { $gt: 0 } },
      { $inc: { availableSeats: -1, registeredCount: 1 } },
      { new: true }
    );
    ```
    If another request decrements `availableSeats` to 0, this update fails, returning `null`.
4.  **Rollback**: The controller immediately catches the null result, deletes the registration log, and returns an error response.

---

## 4. Database Schema Relations

```mermaid
erDiagram
    EVENT {
        ObjectId _id PK
        string title
        string slug UK
        string description
        string longDescription
        date date
        string category
        string location
        string mode
        int availableSeats
        int registeredCount
        string speaker
        string speakerImage
        string speakerTitle
        string duration
        string banner
        string organizer
        string company
        string companyLogo
        double rating
        int reviewsCount
        int price
        string difficulty
        string expectedAudience
        array requirements
        array agenda
        array faqs
        array sponsors
        date createdAt
        date updatedAt
    }

    REGISTRATION {
        ObjectId _id PK
        ObjectId eventId FK
        string name
        string email
        string phone
        string college
        string company
        string source
        string ticketType
        string couponCode
        string paymentStatus
        string referralCode
        date createdAt
        date updatedAt
    }

    ANALYTICS_LOG {
        ObjectId _id PK
        string eventType
        object payload
        string userAgent
        string ipAddress
        date createdAt
    }

    EVENT ||--o{ REGISTRATION : "holds"
```
