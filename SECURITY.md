# Security Policies & Auditing 🛡️

This document outlines the security policies, rate-limiting, and validation protocols implemented in **BharatEvents**.

---

## 1. Core API Safeguards

### 1.1 Express Rate Limiting
To prevent denial of service (DoS) and brute force spam, two rate limiting filters are configured:
1.  **Global Rate Limiter**: Restricts traffic to 100 requests per 15-minute window per IP.
2.  **Registration Limiters**: Restricts form submissions to 10 requests per minute per IP.

### 1.2 CORS Settings
CORS policies whitelist only trusted domains, preventing malicious external scripts from triggering state-changing requests:
```typescript
const corsOptions = {
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
  optionsSuccessStatus: 200,
};
```

### 1.3 Security Headers
API responses include secure headers using the `helmet` package to prevent common security risks like clickjacking and cross-site scripting (XSS):
*   `X-Content-Type-Options: nosniff`
*   `X-Frame-Options: DENY`
*   `Content-Security-Policy` (CSP configurations)

---

## 2. Input Sanitization & Validation

*   **Zod Parsing**: The API uses strict Zod validators to sanitize request parameters and payloads, rejecting unexpected fields.
*   **Mongoose Validation**: Model schemas validate data types, email formats, and string lengths before persisting them to MongoDB.
*   **MongoDB Injection Prevention**: Uses parameterized queries and Mongoose operators rather than raw MongoDB string evaluations to prevent query injection attacks.

---

## 3. Vulnerability Reporting

If you discover a security vulnerability in this project, please report it:
*   Email the developers directly.
*   Do not open public GitHub issues for security reports.
