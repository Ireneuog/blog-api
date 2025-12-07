import { Response } from "express";
import { AuthenticatedRequest } from "../types/request";
import * as commentService from "../services/commentService";
import { ValidationError, UnauthorizedError } from "../types/errors";

/**
 * Create a new comment on a post
 * Route: POST /comments/:postId
 * Requires authentication
 */
export async function createComment(req: AuthenticatedRequest, res: Response) {
  const { postId } = req.params;
  const { content } = req.body;
  const userId = req.user?.userId;

  if (!userId) {
    throw new UnauthorizedError("Utilizador não autenticado");
  }

  if (!content) {
    throw new ValidationError("O comentário não pode estar vazio.");
  }

  const comment = await commentService.createComment(
    Number(postId),
    userId,
    content
  );

  res.status(201).json(comment);
}

/**
 * List all comments for a post
 * Route: GET /comments/:postId
 */
export async function listComments(req: AuthenticatedRequest, res: Response) {
  const { postId } = req.params;

  const comments = await commentService.listComments(Number(postId));
  res.json(comments);
}
