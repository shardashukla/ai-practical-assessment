import type { Request, Response, NextFunction } from 'express';

/**
 * Logs HTTP method, path, and response status for API requests.
 * Skipped in test environment to keep test output clean.
 */
export function requestLogger(req: Request, res: Response, next: NextFunction): void {
  if (process.env.NODE_ENV === 'test') {
    next();
    return;
  }

  const start = Date.now();

  res.on('finish', () => {
    const duration = Date.now() - start;
    console.log(`${req.method} ${req.originalUrl} ${res.statusCode} ${duration}ms`);
  });

  next();
}
