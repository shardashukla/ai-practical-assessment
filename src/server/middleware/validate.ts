import type { Request, Response, NextFunction } from 'express';
import { ZodSchema } from 'zod';
import { formatZodErrors } from '../validators';

/**
 * Express middleware that validates req.body against a Zod schema.
 * On success, replaces req.body with the parsed (coerced) output.
 */
export function validateBody<T>(schema: ZodSchema<T>) {
  return (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);
    if (!result.success) {
      res.status(400).json({
        error: 'Validation failed',
        details: formatZodErrors(result.error),
      });
      return;
    }
    req.body = result.data;
    next();
  };
}
