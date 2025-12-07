import { prisma } from "../prisma";
import {
  UnauthorizedError,
  ValidationError,
  NotFoundError,
} from "../types/errors";

/**
 * Create a new comment on a post
 * @param postId - The ID of the post to comment on
 * @param userId - The ID of the authenticated user
 * @param content - The comment content
 * @throws UnauthorizedError if userId is not provided
 * @throws ValidationError if content is empty
 * @throws NotFoundError if post doesn't exist
 */
export async function createComment(
  postId: number,
  userId: number,
  content: string
) {
  if (!userId) {
    throw new UnauthorizedError("Utilizador não autenticado");
  }

  if (!content || content.trim() === "") {
    throw new ValidationError("O comentário não pode estar vazio");
  }

  // Check if post exists
  const post = await prisma.post.findUnique({
    where: { id: postId },
  });

  if (!post) {
    throw new NotFoundError("Post não encontrado");
  }

  // Create the comment
  const comment = await prisma.comment.create({
    data: {
      content,
      postId,
      userId,
    },
  });

  return comment;
}

/**
 * List all comments for a post, ordered by creation date (newest first)
 * @param postId - The ID of the post
 * @throws NotFoundError if post doesn't exist
 */
export async function listComments(postId: number) {
  // Check if post exists before listing
  const post = await prisma.post.findUnique({
    where: { id: postId },
  });

  if (!post) {
    throw new NotFoundError("Post não encontrado");
  }

  // List comments from newest to oldest
  return prisma.comment.findMany({
    where: { postId },
    orderBy: { createdAt: "desc" },
  });
}
