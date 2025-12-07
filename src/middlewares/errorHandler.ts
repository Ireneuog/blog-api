import { Request, Response, NextFunction } from "express";
import { AppError } from "../types/errors";
import { logger } from "../utils/logger";

/**
 * Centralized error handling middleware
 * Catches all errors from routes and services
 */
export function errorHandler(
  err: Error | AppError,
  req: Request,
  res: Response,
  next: NextFunction
) {
  // Log the error
  logger.error({
    error: err.message,
    name: err.name,
    ...(err instanceof AppError && { status: err.status, code: err.code }),
    path: req.path,
    method: req.method,
  });

  // Handle AppError instances
  if (err instanceof AppError) {
    return res.status(err.status).json({
      error: err.message,
      code: err.code,
    });
  }

  // Handle unexpected errors
  res.status(500).json({
    error: "Erro interno do servidor",
    code: "INTERNAL_SERVER_ERROR",
  });
}
