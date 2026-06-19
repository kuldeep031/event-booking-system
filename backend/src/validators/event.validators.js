import { z } from 'zod';

export const createEventSchema = z
  .object({
    name: z.string().trim().min(2).max(140),
    description: z.string().trim().min(2).max(4000),
    dateTime: z.coerce.date().refine((d) => d.getTime() > Date.now(), {
      message: 'Event date must be in the future',
    }),
    venue: z.string().trim().min(2).max(200),
    totalSeats: z.coerce.number().int().min(1).max(1_000_000),
    price: z.coerce.number().min(0).optional().default(0),
  })
  .strict();

// All fields optional for a partial update; at least one must be present.
export const updateEventSchema = z
  .object({
    name: z.string().trim().min(2).max(140),
    description: z.string().trim().min(2).max(4000),
    dateTime: z.coerce.date().refine((d) => d.getTime() > Date.now(), {
      message: 'Event date must be in the future',
    }),
    venue: z.string().trim().min(2).max(200),
    totalSeats: z.coerce.number().int().min(1).max(1_000_000),
    price: z.coerce.number().min(0),
  })
  .strict()
  .partial()
  .refine((data) => Object.keys(data).length > 0, {
    message: 'Provide at least one field to update',
  });

// Query params for listing/searching events.
export const listEventsSchema = z.object({
  search: z.string().trim().optional(),
  page: z.coerce.number().int().min(1).optional().default(1),
  limit: z.coerce.number().int().min(1).max(100).optional().default(12),
  upcoming: z
    .enum(['true', 'false'])
    .optional()
    .transform((v) => v === 'true'),
});
