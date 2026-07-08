import { Request, Response } from 'express';
import { AnalyticsLog, AnalyticsEventType } from '../models/analytics.model';
import { Event } from '../models/event.model';
import { Registration } from '../models/registration.model';

// POST /api/analytics/log
export const logAnalyticsEvent = async (req: Request, res: Response): Promise<void> => {
  const { eventType, payload } = req.body;

  const newLog = new AnalyticsLog({
    eventType: eventType as AnalyticsEventType,
    payload: payload || {},
    userAgent: req.headers['user-agent'] || '',
    ipAddress: req.ip || '',
  });

  await newLog.save();

  // Log in server console as well
  console.log(`[Analytics Logged] ${eventType} - Payload:`, JSON.stringify(payload));

  res.status(201).json({
    success: true,
    message: 'Event logged successfully',
  });
};

// GET /api/analytics/dashboard
export const getDashboardStats = async (req: Request, res: Response): Promise<void> => {
  // 1. Gather general totals
  const totalEvents = await Event.countDocuments();
  const totalRegistrations = await Registration.countDocuments();

  // Aggregate available seats and filled seats
  const seatStats = await Event.aggregate([
    {
      $group: {
        _id: null,
        available: { $sum: '$availableSeats' },
        filled: { $sum: '$registeredCount' },
      },
    },
  ]);

  const totalAvailableSeats = seatStats.length > 0 ? seatStats[0].available : 0;
  const totalFilledSeats = seatStats.length > 0 ? seatStats[0].filled : 0;

  // 2. Registrations per event (Group registrations by eventId)
  const regPerEventAggregation = await Registration.aggregate([
    {
      $group: {
        _id: '$eventId',
        count: { $sum: 1 },
      },
    },
    {
      $lookup: {
        from: 'events',
        localField: '_id',
        foreignField: '_id',
        as: 'eventInfo',
      },
    },
    {
      $unwind: '$eventInfo',
    },
    {
      $project: {
        eventId: '$_id',
        title: '$eventInfo.title',
        category: '$eventInfo.category',
        count: 1,
        _id: 0,
      },
    },
    {
      $sort: { count: -1 },
    },
  ]);

  // 3. Top events (Events sorted by registeredCount)
  const topEvents = await Event.find()
    .sort({ registeredCount: -1 })
    .limit(5)
    .select('title category mode location availableSeats registeredCount speaker');

  // 4. Recent registrations
  const recentRegistrations = await Registration.find()
    .sort({ createdAt: -1 })
    .limit(10)
    .populate('eventId', 'title category date');

  res.status(200).json({
    success: true,
    data: {
      totals: {
        totalEvents,
        totalRegistrations,
        totalAvailableSeats,
        totalFilledSeats,
      },
      registrationsPerEvent: regPerEventAggregation,
      topEvents,
      recentRegistrations,
    },
  });
};

// GET /api/analytics/registrations
// Returns all registrations with keyword search capability across name, email, college, company, and event title
export const searchAllRegistrations = async (req: Request, res: Response): Promise<void> => {
  const { search } = req.query;

  let query: any = {};

  if (search) {
    const searchRegex = new RegExp(search as string, 'i');
    
    // First, find events that match the title search
    const matchingEvents = await Event.find({ title: searchRegex }).select('_id');
    const matchingEventIds = matchingEvents.map((evt) => evt._id);

    query = {
      $or: [
        { name: searchRegex },
        { email: searchRegex },
        { phone: searchRegex },
        { college: searchRegex },
        { company: searchRegex },
        { eventId: { $in: matchingEventIds } },
      ],
    };
  }

  const registrations = await Registration.find(query)
    .sort({ createdAt: -1 })
    .populate('eventId', 'title category location mode date price');

  res.status(200).json({
    success: true,
    data: registrations,
  });
};
