import { Event } from '../models/Event.js';
import { Booking } from '../models/Booking.js';

// POST /api/bookings — book N seats for an event.
//
// Concurrency safety: the seat reservation is a SINGLE atomic findOneAndUpdate
// guarded by `availableSeats >= seats`. MongoDB applies a matched update
// atomically, so two simultaneous requests can never both decrement past zero
// (no overbooking) — without a transaction or a read-then-write race.
export const createBooking = async (req, res, next) => {
  try {
    const { eventId, seats } = req.body;

    const event = await Event.findById(eventId);
    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }
    if (event.dateTime.getTime() <= Date.now()) {
      return res.status(400).json({ message: 'This event has already started or ended' });
    }

    // Atomically reserve the seats only if enough remain.
    const reserved = await Event.findOneAndUpdate(
      { _id: eventId, availableSeats: { $gte: seats } },
      { $inc: { availableSeats: -seats } },
      { new: true }
    );

    if (!reserved) {
      return res.status(409).json({
        message: `Not enough seats available. Only ${event.availableSeats} left.`,
      });
    }

    let booking;
    try {
      booking = await Booking.create({ user: req.user.id, event: eventId, seats });
    } catch (err) {
      // Booking record failed — give the reserved seats back so they aren't lost.
      await Event.updateOne({ _id: eventId }, { $inc: { availableSeats: seats } });
      throw err;
    }

    await booking.populate('event');
    res.status(201).json({ booking });
  } catch (err) {
    next(err);
  }
};

// GET /api/bookings — the authenticated user's bookings (newest first).
export const getMyBookings = async (req, res, next) => {
  try {
    const bookings = await Booking.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .populate('event');
    res.json({ bookings });
  } catch (err) {
    next(err);
  }
};

// PATCH /api/bookings/:id/cancel — cancel a booking and release its seats.
//
// Guard: only a *confirmed* booking releases seats, so a double-cancel can
// never inflate the event's available-seat count.
export const cancelBooking = async (req, res, next) => {
  try {
    const booking = await Booking.findOne({ _id: req.params.id, user: req.user.id });
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    if (booking.status === 'cancelled') {
      return res.status(400).json({ message: 'This booking is already cancelled' });
    }

    booking.status = 'cancelled';
    await booking.save();

    // Return the seats to the event's inventory.
    await Event.updateOne({ _id: booking.event }, { $inc: { availableSeats: booking.seats } });

    await booking.populate('event');
    res.json({ booking });
  } catch (err) {
    next(err);
  }
};
