import { Request, Response } from 'express';
import { Event } from '../models/event.model';
import { CustomError } from '../middlewares/error.middleware';

// GET /api/events
export const getEvents = async (req: Request, res: Response): Promise<void> => {
  const { category, mode, location, search, page = '1', limit = '8' } = req.query;

  const query: any = {};

  if (category) {
    query.category = category;
  }

  if (mode) {
    query.mode = mode;
  }

  if (location) {
    query.location = { $regex: new RegExp(location as string, 'i') };
  }

  if (search) {
    query.title = { $regex: new RegExp(search as string, 'i') };
  }

  const pageNum = parseInt(page as string, 10);
  const limitNum = parseInt(limit as string, 10);
  const skip = (pageNum - 1) * limitNum;

  const totalCount = await Event.countDocuments(query);
  const events = await Event.find(query)
    .sort({ date: 1 }) // Soonest events first
    .skip(skip)
    .limit(limitNum);

  const totalPages = Math.ceil(totalCount / limitNum);

  res.status(200).json({
    success: true,
    data: {
      events,
      pagination: {
        totalCount,
        totalPages,
        currentPage: pageNum,
        limit: limitNum,
      },
    },
  });
};

// GET /api/events/:id
export const getEventById = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  // Let's allow fetching by either Mongo ObjectId or by Slug
  const isObjectId = id.match(/^[0-9a-fA-F]{24}$/);
  const query = isObjectId ? { _id: id } : { slug: id };

  const event = await Event.findOne(query);

  if (!event) {
    const error: CustomError = new Error('Event not found');
    error.statusCode = 404;
    throw error;
  }

  res.status(200).json({
    success: true,
    data: event,
  });
};

// POST /api/events
export const createEvent = async (req: Request, res: Response): Promise<void> => {
  const {
    title,
    description,
    longDescription,
    date,
    category,
    location,
    mode,
    availableSeats,
    speaker,
    duration,
    banner,
  } = req.body;

  // Helper to generate a URL slug from the title
  const baseSlug = title
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
  
  // Ensure uniqueness of slug
  let slug = baseSlug;
  let exists = await Event.findOne({ slug });
  let count = 1;
  while (exists) {
    slug = `${baseSlug}-${count}`;
    exists = await Event.findOne({ slug });
    count++;
  }

  const newEvent = new Event({
    title,
    slug,
    description,
    longDescription,
    date: new Date(date),
    category,
    location,
    mode,
    availableSeats,
    registeredCount: 0,
    speaker,
    duration,
    banner,
  });

  const savedEvent = await newEvent.save();

  res.status(201).json({
    success: true,
    data: savedEvent,
  });
};
