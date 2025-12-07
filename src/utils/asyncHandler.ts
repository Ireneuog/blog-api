import { Request, Response, NextFunction } from "express";

/**
 * Wrapper to catch async errors in Express route handlers
 * Passes errors to the error handler middleware
 */
export const asyncHandler =
  (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) =>
  (req: Request, res: Response, next: NextFunction) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
