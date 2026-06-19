import { ApiError } from '../utils/ApiError.js';

// Validates req[source] against a zod schema, replacing it with the parsed
// (and coerced) data. Throws a 400 ApiError with a readable message on failure.
export const validate =
  (schema, source = 'body') =>
  (req, _res, next) => {
    const result = schema.safeParse(req[source]);
    if (!result.success) {
      const message = result.error.issues
        .map((i) => `${i.path.join('.') || source}: ${i.message}`)
        .join('; ');
      return next(new ApiError(400, message));
    }
    req[source] = result.data;
    next();
  };
