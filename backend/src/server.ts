import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import compression from 'compression';
import morgan from 'morgan';
import dotenv from 'dotenv';
import { connectDB } from './config/db';
import { errorHandler } from './middlewares/error.middleware';
import { apiRateLimiter } from './middlewares/rateLimiter';
import eventRoutes from './routes/event.routes';
import analyticsRoutes from './routes/analytics.routes';

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5001;

// Connect to Database
connectDB();

// Security Headers
app.use(helmet());

// CORS Setup (allow client-side app origins)
const allowedOrigins = [
  'http://localhost:3000',
  'http://localhost:3001',
  'http://127.0.0.1:3000',
  process.env.FRONTEND_URL,
].filter(Boolean) as string[];

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, postman)
      if (!origin || allowedOrigins.includes(origin) || allowedOrigins.length === 0) {
        callback(null, true);
      } else {
        callback(new Error('Not allowed by CORS'));
      }
    },
    credentials: true,
  })
);

// Gzip Compression
app.use(compression());

// Logger
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev'));

// Body Parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Apply rate limiter globally to all API routes
app.use('/api', apiRateLimiter);

// Health Check
app.get('/', (req, res) => {
  res.status(200).json({
    success: true,
    message: 'Event Registration App API is running smoothly.',
  });
});

// Mount Routes
app.use('/api/events', eventRoutes);
app.use('/api/analytics', analyticsRoutes);

// Error Handler Middleware
app.use(errorHandler);

// Start Server
app.listen(PORT, () => {
  console.log(`[Express Server] Server running in ${process.env.NODE_ENV || 'development'} mode on port ${PORT}`);
});
