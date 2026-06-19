import { Router } from 'express';

import {
  createBooking,
  getMyBookings,
  cancelBooking,
} from '../controllers/booking.controller.js';
import { validate } from '../middleware/validate.js';
import { protect } from '../middleware/auth.js';
import { createBookingSchema } from '../validators/booking.validators.js';

const router = Router();

// Every booking route requires authentication.
router.use(protect);

router.post('/', validate(createBookingSchema), createBooking);
router.get('/', getMyBookings);
router.patch('/:id/cancel', cancelBooking);

export default router;
