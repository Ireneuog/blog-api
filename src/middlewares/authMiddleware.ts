import { NextFunction, Response } from "express";
import { AuthenticatedRequest } from "../types/request";
import { UnauthorizedError } from "../types/errors";

/**
 * Authentication middleware
 * Extracts user information from request and validates authentication
 * 
 * TODO: In production, this should validate JWT tokens or session cookies
 * For now, it expects userId to be provided in headers for testing
 */
export function authMiddleware(
  req: AuthenticatedRequest,
  res: Response,
  next: NextFunction
) {
  try {
    // In development/testing: get userId from header
    const userId = req.headers["x-user-id"];
    const userEmail = req.headers["x-user-email"] as string | undefined;

    if (!userId) {
      throw new UnauthorizedError();
    }

    // Attach user to request
    req.user = {
      userId: Number(userId),
      email: userEmail || `user-${userId}@example.com`,
    };

    next();
  } catch (err) {
    next(err);
  }
}
