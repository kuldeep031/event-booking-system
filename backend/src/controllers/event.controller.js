import { Event } from '../models/Event.js';
import { Booking } from '../models/Booking.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

// GET /api/events  (public) — supports ?search= &page= &limit= &upcoming=true
export const listEvents = asyncHandler(async (req, res) => {
  const { search, page, limit, upcoming } = req.query;

  const filter = {};
  if (search) {
    filter.$or = [
      { name: { $regex: search, $options: 'i' } },
      { venue: { $regex: search, $options: 'i' } },
    ];
  }
  if (upcoming) {
    filter.dateTime = { $gte: new Date() };
  }

  const skip = (page - 1) * limit;

  const [events, total] = await Promise.all([
    Event.find(filter).sort({ dateTime: 1 }).skip(skip).limit(limit),
    Event.countDocuments(filter),
  ]);

  res.json({
    events,
    pagination: {
      page,
      limit,
      total,
      totalPages: Math.ceil(total / limit),
    },
  });
});

// GET /api/events/:id  (public)
export const getEvent = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);
  if (!event) {
    throw new ApiError(404, 'Event not found');
  }
  res.json({ event });
});

// POST /api/events  (admin only)
export const createEvent = asyncHandler(async (req, res) => {
  const { totalSeats } = req.body;
  const event = await Event.create({
    ...req.body,
    availableSeats: totalSeats,
    createdBy: req.user.id,
  });
  res.status(201).json({ event });
});

// PATCH /api/events/:id  (admin only)
export const updateEvent = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);
  if (!event) {
    throw new ApiError(404, 'Event not found');
  }

  // If totalSeats changes, keep availableSeats consistent with seats already
  // booked (booked = previous total - previous available).
  if (req.body.totalSeats !== undefined) {
    const booked = event.totalSeats - event.availableSeats;
    const newAvailable = req.body.totalSeats - booked;
    if (newAvailable < 0) {
      throw new ApiError(
        400,
        `Cannot set total seats to ${req.body.totalSeats}: ${booked} are already booked.`
      );
    }
    event.availableSeats = newAvailable;
  }

  Object.assign(event, req.body);
  await event.save();
  res.json({ event });
});

// DELETE /api/events/:id  (admin only)
export const deleteEvent = asyncHandler(async (req, res) => {
  const event = await Event.findById(req.params.id);
  if (!event) {
    throw new ApiError(404, 'Event not found');
  }

  // Block deletion while active (confirmed) bookings exist, to protect attendees.
  const activeBookings = await Booking.countDocuments({
    event: event.id,
    status: 'confirmed',
  });
  if (activeBookings > 0) {
    throw new ApiError(
      409,
      `Cannot delete: ${activeBookings} active booking(s) exist. Ask attendees to cancel first.`
    );
  }

  await event.deleteOne();
  res.json({ message: 'Event deleted' });
});
