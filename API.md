# API Specifications 🔌

All requests and responses use the standard `application/json` format.

---

## 1. Base Configurations

*   **Local Development**: `http://localhost:5001/api`
*   **Default Headers**:
    ```http
    Content-Type: application/json
    Accept: application/json
    ```

---

## 2. Event Endpoints

### 2.1 List Events
*   **Route**: `GET /api/events`
*   **Query Parameters**:
    *   `search` (string, optional) - Filters by title
    *   `category` (string, optional) - Filters by category
    *   `mode` (string, optional) - `Online` | `Offline` | `Hybrid`
    *   `location` (string, optional) - Filters by city name
    *   `page` (number, default: 1)
    *   `limit` (number, default: 8)
*   **Success Response (200 OK)**:
    ```json
    {
      "events": [
        {
          "_id": "603d2e9f...",
          "title": "Next.js Advanced Workshop",
          "slug": "nextjs-advanced-workshop",
          "category": "Workshop",
          "mode": "Online",
          "availableSeats": 45,
          "registeredCount": 5,
          "price": 0,
          "rating": 4.8,
          "reviewsCount": 42
        }
      ],
      "pagination": {
        "totalCount": 100,
        "totalPages": 13,
        "currentPage": 1,
        "limit": 8
      }
    }
    ```

### 2.2 Get Event by ID or Slug
*   **Route**: `GET /api/events/:id`
*   **Parameters**: `:id` accepts either MongoDB `ObjectId` or the unique `slug`.
*   **Success Response (200 OK)**:
    ```json
    {
      "_id": "603d2e9f...",
      "title": "Next.js Advanced Workshop",
      "slug": "nextjs-advanced-workshop",
      "description": "Short description...",
      "longDescription": "Extended text...",
      "date": "2026-10-15T09:30:00.000Z",
      "category": "Workshop",
      "mode": "Online",
      "availableSeats": 45,
      "registeredCount": 5,
      "speaker": "Aravind Nair",
      "speakerImage": "https://...",
      "speakerTitle": "Staff Engineer, Vercel",
      "duration": "3 Hours",
      "banner": "https://...",
      "organizer": "TechLabs",
      "price": 0,
      "rating": 4.8,
      "reviewsCount": 42,
      "difficulty": "Advanced",
      "expectedAudience": "Frontend Engineers",
      "requirements": ["Laptop", "Basic React knowledge"],
      "agenda": [
        { "time": "09:30 AM", "title": "Setup", "description": "Repo clones" }
      ],
      "faqs": [
        { "question": "Prerequisites?", "answer": "React basics." }
      ],
      "sponsors": [
        { "name": "Vercel", "logo": "https://..." }
      ]
    }
    ```

### 2.3 Register for Event
*   **Route**: `POST /api/events/:id/register`
*   **Body Parameters (Zod Validated)**:
    ```json
    {
      "name": "Arjun Patel",
      "email": "arjun.patel@example.com",
      "phone": "9876543210",
      "college": "IIT Bombay",
      "company": "",
      "source": "LinkedIn",
      "ticketType": "General Admission",
      "couponCode": "EARLYBIRD20",
      "referralCode": ""
    }
    ```
*   **Success Response (201 Created)**:
    ```json
    {
      "message": "Registration successful",
      "registration": {
        "_id": "603d2eaf...",
        "eventId": "603d2e9f...",
        "name": "Arjun Patel",
        "email": "arjun.patel@example.com",
        "phone": "9876543210",
        "ticketType": "General Admission",
        "paymentStatus": "Free",
        "createdAt": "2026-07-08T09:16:00.000Z"
      }
    }
    ```
*   **Failure Response (400 Bad Request)**:
    ```json
    {
      "message": "Email is already registered for this event"
    }
    ```

---

## 3. Analytics Endpoints

### 3.1 Log Analytics Event
*   **Route**: `POST /api/analytics/log`
*   **Body Parameters**:
    ```json
    {
      "eventType": "event_card_clicked",
      "payload": {
        "eventId": "603d2e9f...",
        "eventName": "Next.js Advanced Workshop"
      }
    }
    ```
*   **Success Response (201 Created)**:
    ```json
    {
      "success": true
    }
    ```

### 3.2 Fetch Admin Dashboard Analytics
*   **Route**: `GET /api/analytics/dashboard`
*   **Headers**: Requires auth cookie/passphrase validation checks.
*   **Success Response (200 OK)**:
    ```json
    {
      "totals": {
        "totalEvents": 100,
        "totalRegistrations": 108,
        "totalAvailableSeats": 4192,
        "totalFilledSeats": 108,
        "totalRevenue": 24500
      },
      "registrationTrends": [
        { "date": "2026-07-01", "count": 12 }
      ],
      "referralStats": [
        { "source": "LinkedIn", "count": 42 }
      ],
      "cityStats": [
        { "city": "Bengaluru", "count": 28 }
      ],
      "categoryStats": [
        { "category": "Workshop", "count": 35 }
      ],
      "funnel": {
        "views": 482,
        "clicks": 298,
        "submissions": 124,
        "successes": 108
      },
      "systemHealth": {
        "mongodb": "Connected",
        "nodeVersion": "v24.16.0",
        "memory": "72.4 MB / 4096 MB",
        "uptime": "2h 15m 10s"
      }
    }
    ```
