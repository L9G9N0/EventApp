# Production Deployment Guide 🚀

This document outlines the deployment process for **BharatEvents** to production environments.

---

## 1. Hosting Services

*   **Backend Server**: Deploy to **Render** Web Service (or AWS Elastic Beanstalk).
*   **Frontend Client**: Deploy to **Vercel** (optimizes Next.js static and dynamic routing).
*   **Database Cloud**: Deploy to **MongoDB Atlas** (Free M0 or shared instance).

---

## 2. Step 1: Database Setup (MongoDB Atlas)

1.  Create a cluster on [MongoDB Atlas](https://www.mongodb.com/cloud/atlas).
2.  In **Network Access**, whitelist the IP addresses of your hosting servers (or allow `0.0.0.0/0` for serverless environments).
3.  Copy the connection string (e.g. `mongodb+srv://<username>:<password>@cluster0.mongodb.net/event_db`).

---

## 3. Step 2: Backend Server Deployment (Render)

1.  Connect your GitHub repository to [Render](https://render.com/).
2.  Create a new **Web Service** pointing to the repository.
3.  Configure the build and start commands:
    *   **Root Directory**: `backend`
    *   **Build Command**: `npm install && npm run build` (Wait! The backend runs TS via `ts-node` or compiles to JS. Ensure build step runs `tsc` compiler).
    *   **Start Command**: `node dist/server.js` (or `npm start`).
4.  Add environment variables in the Render settings:
    *   `PORT` = `10000` (Render handles port mapping automatically)
    *   `MONGO_URI` = `mongodb+srv://...` (your Atlas URI)
    *   `NODE_ENV` = `production`
    *   `FRONTEND_URL` = `https://your-frontend-domain.vercel.app`

---

## 4. Step 3: Frontend Client Deployment (Vercel)

1.  Connect your repository to [Vercel](https://vercel.com/).
2.  Create a new project.
3.  Configure root project targets:
    *   **Root Directory**: `frontend`
    *   **Framework Preset**: `Next.js`
4.  Configure environment variables:
    *   `NEXT_PUBLIC_API_URL` = `https://your-backend-domain.onrender.com`
5.  Click **Deploy**. Vercel will build the frontend, analyze dynamic pages, and issue free SSL certificates automatically.
