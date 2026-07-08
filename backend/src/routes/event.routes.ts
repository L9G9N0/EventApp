import { Router } from 'express';
import { getEvents, getEventById, createEvent } from '../controllers/eventController';
import { registerForEvent, getEventRegistrations } from '../controllers/registrationController';
import { asyncWrapper } from '../utils/asyncWrapper';
import { validateRequest } from '../middlewares/validate.middleware';
import { registrationValidationSchema } from '../validators/validateRegistration';
import { registrationRateLimiter } from '../middlewares/rateLimiter';

const router = Router();

// GET /api/events - List events (filtered/searched/paginated)
router.get('/', asyncWrapper(getEvents));

// POST /api/events - Create new event
router.post('/', asyncWrapper(createEvent));

// GET /api/events/:id - Get specific event by ID or slug
router.get('/:id', asyncWrapper(getEventById));

// POST /api/events/:id/register - Register for an event
router.post(
  '/:id/register',
  registrationRateLimiter,
  validateRequest(registrationValidationSchema),
  asyncWrapper(registerForEvent)
);

// GET /api/events/:id/registrations - Get all registrations for an event
router.get('/:id/registrations', asyncWrapper(getEventRegistrations));

export default router;
