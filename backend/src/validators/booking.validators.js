import { z } from 'zod';

export const createBookingSchema = z
  .object({
    eventId: z.string().regex(/^[0-9a-fA-F]{24}$/, 'A valid eventId is required'),
    seats: z.coerce.number().int().min(1, 'Book at least 1 seat').max(10, 'You can book at most 10 seats per booking'),
  })
  .strict();
