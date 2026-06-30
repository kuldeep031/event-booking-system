import { Event } from '../models/Event.js';
import { Booking } from '../models/Booking.js';

// GET /api/events  (public) — supports ?search= &page= &limit= &upcoming=true
export const listEvents = async (req, res, next) => {
  try {
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
      pagination: { page, limit, total, totalPages: Math.ceil(total / limit) },
    });
  } catch (err) {
    next(err);
  }
};

// GET /api/events/:id  (public)
export const getEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    res.json({ event });
  } catch (err) {
    next(err);
  }
};

// POST /api/events  (admin only)
export const createEvent = async (req, res, next) => {
  try {
    const { totalSeats } = req.body;
    const event = await Event.create({
      ...req.body,
      availableSeats: totalSeats,
      createdBy: req.user.id,
    });
    res.status(201).json({ event });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/events/:id  (admin only)
export const updateEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // If totalSeats changes, keep availableSeats consistent with seats already
    // booked (booked = previous total - previous available).
    if (req.body.totalSeats !== undefined) {
      const booked = event.totalSeats - event.availableSeats;
      const newAvailable = req.body.totalSeats - booked;
      if (newAvailable < 0) {
        return res.status(400).json({
          message: `Cannot set total seats to ${req.body.totalSeats}: ${booked} are already booked.`,
        });
      }
      event.availableSeats = newAvailable;
    }

    Object.assign(event, req.body);
    await event.save();
    res.json({ event });
  } catch (err) {
    next(err);
  }
};

// DELETE /api/events/:id  (admin only)
export const deleteEvent = async (req, res, next) => {
  try {
    const event = await Event.findById(req.params.id);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    // Block deletion while active (confirmed) bookings exist, to protect attendees.
    const activeBookings = await Booking.countDocuments({
      event: event.id,
      status: 'confirmed',
    });
    if (activeBookings > 0) {
      return res.status(409).json({
        message: `Cannot delete: ${activeBookings} active booking(s) exist. Ask attendees to cancel first.`,
      });
    }

    await event.deleteOne();
    res.json({ message: 'Event deleted' });
  } catch (err) {
    next(err);
  }
};
