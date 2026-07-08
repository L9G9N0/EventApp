# Developer Guide 🛠️

This document outlines the local development environment configurations and workflow guides.

---

## 1. Local Prerequisites

*   **Node.js**: Version `v24.16.0` or higher (Active LTS recommended).
*   **Package Manager**: `npm` v11.13.0 or higher.
*   **Database**: MongoDB Community Server version 7.0 or higher running locally on port `27017`.

---

## 2. Fast Setup Commands

1.  **Clone and Enter Workspace**:
    ```bash
    cd Event_App
    ```
2.  **Bootstrap Environment Variables**:
    *   Duplicate `backend/.env.example` as `backend/.env`.
    *   Duplicate `frontend/.env.local.example` as `frontend/.env.local`.
3.  **Install dependencies and seed database**:
    ```bash
    npm run install:all
    npm run seed
    ```
4.  **Run Dev Environment**:
    *   Terminal A: `npm run dev:backend`
    *   Terminal B: `npm run dev:frontend`

---

## 3. Engineering Guidelines

*   **TypeScript Strictness**: `strict` configuration is enabled. Avoid using `any` parameters; define custom interfaces in `frontend/types/index.ts`.
*   **Component Modularity**: Keep frontend parts lightweight. Extract large screens into dedicated sub-components within `/components`.
*   **Form Validation**: Always pair form submissions with client-side Zod resolvers and backend database schema validation constraints.
*   **Git Commits**: Use descriptive commit logs with structural tags (e.g. `feat: ...`, `fix: ...`, `docs: ...`).

---

## 4. Troubleshooting Local Issues

### 4.1 MongoDB Connection Failures
*   **Symptom**: `MongooseServerSelectionError: connect ECONNREFUSED`
*   **Fix**: Ensure local MongoDB instance is running:
    *   macOS: `brew services start mongodb-community@7.0`
    *   Linux: `sudo systemctl start mongod`

### 4.2 Port 5001 Already in Use
*   **Symptom**: `Error: listen EADDRINUSE: address already in use :::5001`
*   **Fix**: Kill any hanging background node processes running on port 5001:
    ```bash
    lsof -t -i:5001 | xargs kill -9
    ```

### 4.3 Static Generation Site Build Failure
*   **Symptom**: Next.js fails to build sitemaps or dynamic routes if the backend server is offline during compiles.
*   **Fix**: The compilation has fallback mechanisms built-in. However, starting the backend server before executing `npm run build` inside the frontend ensures clean site compilation.
