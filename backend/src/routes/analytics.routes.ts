import { Router } from 'express';
import {
  logAnalyticsEvent,
  getDashboardStats,
  searchAllRegistrations,
} from '../controllers/analyticsController';
import { asyncWrapper } from '../utils/asyncWrapper';

const router = Router();

// POST /api/analytics/log - Log a user action
router.post('/log', asyncWrapper(logAnalyticsEvent));

// GET /api/analytics/dashboard - Fetch KPI statistics for the dashboard
router.get('/dashboard', asyncWrapper(getDashboardStats));

// GET /api/analytics/registrations - Search and export registrations
router.get('/registrations', asyncWrapper(searchAllRegistrations));

export default router;
