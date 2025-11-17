import { prisma } from "../prisma/client";

export async function createComment(postId: number, userId: number, content: string) {
  // Verificar se o post existe
  const post = await prisma.post.findUnique({ where: { id: postId } });
  if (!post) {
    throw { status: 404, message: "Post não encontrado" };
  }

  // Criar o comentário
  const comment = await prisma.comment.create({
    data: {
      content,
      postId,
      userId,
    },
  });

  return comment;
}

export async function listComments(postId: number) {
  // Verificar se o post existe
  const post = await prisma.post.findUnique({ where: { id: postId } });
  if (!post) {
    throw { status: 404, message: "Post não encontrado" };
  }

  // Listar os comentários
  return prisma.comment.findMany({
    where: { postId },
    orderBy: { createdAt: "desc" },
  });
}
