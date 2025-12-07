import { prisma } from "../prisma";
import {
  ValidationError,
  ForbiddenError,
  NotFoundError,
} from "../types/errors";

/**
 * Update a post with new title and content
 * @param postId - The ID of the post to update
 * @param userId - The ID of the authenticated user
 * @param title - New post title
 * @param content - New post content
 * @throws ValidationError if title or content are missing
 * @throws NotFoundError if post doesn't exist
 * @throws ForbiddenError if user is not the post owner
 */
export async function updatePost(
  postId: number,
  userId: number,
  title: string,
  content: string
) {
  if (!title || !content) {
    throw new ValidationError("Título e conteúdo são obrigatórios");
  }

  const post = await prisma.post.findUnique({ where: { id: postId } });
  if (!post) {
    throw new NotFoundError("Post não encontrado");
  }

  if (post.userId !== userId) {
    throw new ForbiddenError("Não tens permissão para editar este post");
  }

  const updated = await prisma.post.update({
    where: { id: postId },
    data: { title, content },
  });

  return updated;
}

/**
 * Delete a post and all associated comments
 * @param postId - The ID of the post to delete
 * @param userId - The ID of the authenticated user
 * @throws NotFoundError if post doesn't exist
 * @throws ForbiddenError if user is not the post owner
 */
export async function deletePost(postId: number, userId: number) {
  const post = await prisma.post.findUnique({ where: { id: postId } });
  if (!post) {
    throw new NotFoundError("Post não encontrado");
  }

  if (post.userId !== userId) {
    throw new ForbiddenError("Não tens permissão para apagar este post");
  }

  // Delete associated comments first
  await prisma.comment.deleteMany({ where: { postId } });

  // Delete the post
  await prisma.post.delete({ where: { id: postId } });
}
