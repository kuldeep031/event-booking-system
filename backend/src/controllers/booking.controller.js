import { Event } from '../models/Event.js';
import { Booking } from '../models/Booking.js';
import { ApiError } from '../utils/ApiError.js';
import { asyncHandler } from '../utils/asyncHandler.js';

// POST /api/bookings  — book N seats for an event.
//
// Concurrency safety: the seat reservation is a SINGLE atomic findOneAndUpdate
// guarded by `availableSeats >= seats`. MongoDB applies the matched update
// atomically, so two simultaneous requests can never both decrement past zero
// (no overbooking) — without needing a transaction or a read-then-write race.
export const createBooking = asyncHandler(async (req, res) => {
  const { eventId, seats } = req.body;

  const event = await Event.findById(eventId);
  if (!event) {
    throw new ApiError(404, 'Event not found');
  }
  if (event.dateTime.getTime() <= Date.now()) {
    throw new ApiError(400, 'This event has already started or ended');
  }

  // Atomically reserve the seats only if enough remain.
  const reserved = await Event.findOneAndUpdate(
    { _id: eventId, availableSeats: { $gte: seats } },
    { $inc: { availableSeats: -seats } },
    { new: true }
  );

  if (!reserved) {
    throw new ApiError(
      409,
      `Not enough seats available. Only ${event.availableSeats} left.`
    );
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
});

// GET /api/bookings — the authenticated user's bookings (newest first).
export const getMyBookings = asyncHandler(async (req, res) => {
  const bookings = await Booking.find({ user: req.user.id })
    .sort({ createdAt: -1 })
    .populate('event');
  res.json({ bookings });
});

// PATCH /api/bookings/:id/cancel — cancel a booking and release its seats.
//
// Guard: only a *confirmed* booking releases seats. Flipping status and
// releasing seats is gated on the current status so a double-cancel can never
// inflate the event's inventory.
export const cancelBooking = asyncHandler(async (req, res) => {
  const booking = await Booking.findOne({ _id: req.params.id, user: req.user.id });
  if (!booking) {
    throw new ApiError(404, 'Booking not found');
  }
  if (booking.status === 'cancelled') {
    throw new ApiError(400, 'This booking is already cancelled');
  }

  booking.status = 'cancelled';
  await booking.save();

  // Return the seats to the event's inventory.
  await Event.updateOne({ _id: booking.event }, { $inc: { availableSeats: booking.seats } });

  await booking.populate('event');
  res.json({ booking });
});
