import { Response } from "express";
import { AuthenticatedRequest } from "../types/request";
import * as postService from "../services/postService";

/**
 * Update a post
 * Route: PUT /posts/:id
 * Requires authentication
 */
export async function updatePost(req: AuthenticatedRequest, res: Response) {
  const postId = Number(req.params.id);
  const { title, content } = req.body;
  const userId = req.user?.userId;

  const updated = await postService.updatePost(postId, userId!, title, content);
  res.json(updated);
}

/**
 * Delete a post
 * Route: DELETE /posts/:id
 * Requires authentication
 */
export async function deletePost(req: AuthenticatedRequest, res: Response) {
  const postId = Number(req.params.id);
  const userId = req.user?.userId;

  await postService.deletePost(postId, userId!);
  res.status(204).send();
}