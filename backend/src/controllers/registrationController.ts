import { Request, Response } from 'express';
import { Registration } from '../models/registration.model';
import { Event } from '../models/event.model';
import { CustomError } from '../middlewares/error.middleware';

// POST /api/events/:id/register
export const registerForEvent = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;
  const { name, email, phone, college, company, source } = req.body;

  const lowercaseEmail = email.toLowerCase().trim();

  // 1. Verify that the event exists
  const event = await Event.findById(id);
  if (!event) {
    const error: CustomError = new Error('Event not found');
    error.statusCode = 404;
    throw error;
  }

  // 2. Check if the event is already full
  if (event.availableSeats <= 0) {
    const error: CustomError = new Error('Event is fully booked. No seats available.');
    error.statusCode = 400;
    throw error;
  }

  // 3. Check if email already registered for this event
  const existingRegistration = await Registration.findOne({
    eventId: id,
    email: lowercaseEmail,
  });

  if (existingRegistration) {
    const error: CustomError = new Error('This email is already registered for this event');
    error.statusCode = 400;
    throw error;
  }

  let newRegistration;
  try {
    // 4. Create registration record
    newRegistration = new Registration({
      eventId: id,
      name,
      email: lowercaseEmail,
      phone,
      college,
      company,
      source,
    });

    await newRegistration.save();
  } catch (err: any) {
    // Catch unique index violation (MongoDB code 11000)
    if (err.code === 11000) {
      const error: CustomError = new Error('This email is already registered for this event');
      error.statusCode = 400;
      throw error;
    }
    throw err;
  }

  // 5. Atomically decrement available seats and increment registered count.
  // We use a query filter { availableSeats: { $gt: 0 } } to prevent race conditions.
  const updatedEvent = await Event.findOneAndUpdate(
    { _id: id, availableSeats: { $gt: 0 } },
    { $inc: { availableSeats: -1, registeredCount: 1 } },
    { new: true }
  );

  // If the atomic update fails (e.g. seats became 0 between check and update), rollback!
  if (!updatedEvent) {
    await Registration.deleteOne({ _id: newRegistration._id });
    const error: CustomError = new Error('All seats for this event have been filled');
    error.statusCode = 400;
    throw error;
  }

  res.status(201).json({
    success: true,
    message: 'Registered successfully',
    data: {
      registration: newRegistration,
      event: {
        id: updatedEvent._id,
        title: updatedEvent.title,
        availableSeats: updatedEvent.availableSeats,
        registeredCount: updatedEvent.registeredCount,
      },
    },
  });
};

// GET /api/events/:id/registrations
export const getEventRegistrations = async (req: Request, res: Response): Promise<void> => {
  const { id } = req.params;

  const event = await Event.findById(id);
  if (!event) {
    const error: CustomError = new Error('Event not found');
    error.statusCode = 404;
    throw error;
  }

  const registrations = await Registration.find({ eventId: id }).sort({ createdAt: -1 });

  res.status(200).json({
    success: true,
    data: registrations,
  });
};
