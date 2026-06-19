import { Router } from 'express';

import {
  listEvents,
  getEvent,
  createEvent,
  updateEvent,
  deleteEvent,
} from '../controllers/event.controller.js';
import { validate } from '../middleware/validate.js';
import { protect, authorize } from '../middleware/auth.js';
import {
  createEventSchema,
  updateEventSchema,
  listEventsSchema,
} from '../validators/event.validators.js';

const router = Router();

router.get('/', validate(listEventsSchema, 'query'), listEvents);
router.get('/:id', getEvent);

// Event management is an admin-only enhancement.
router.post('/', protect, authorize('admin'), validate(createEventSchema), createEvent);
router.patch('/:id', protect, authorize('admin'), validate(updateEventSchema), updateEvent);
router.delete('/:id', protect, authorize('admin'), deleteEvent);

export default router;
