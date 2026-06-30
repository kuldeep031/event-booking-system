// Validates req[source] against a zod schema, replacing it with the parsed
// (and coerced) data. Responds with 400 and a readable message on failure.
export const validate =
  (schema, source = 'body') =>
  (req, res, next) => {
    const result = schema.safeParse(req[source]);
    if (!result.success) {
      const message = result.error.issues
        .map((i) => `${i.path.join('.') || source}: ${i.message}`)
        .join('; ');
      return res.status(400).json({ message });
    }
    req[source] = result.data;
    next();
  };
