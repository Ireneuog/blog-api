import { prisma } from "../prisma/client";

export async function createComment(
  postId: number,
  userId: number,
  content: string
) {
  if (!userId) {
    throw { status: 401, message: "Utilizador não autenticado" };
  }

  if (!content || content.trim() === "") {
    throw { status: 400, message: "O comentário não pode estar vazio" };
  }

  // Verificar se o post existe
  const post = await prisma.post.findUnique({
    where: { id: postId },
  });

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
  // Verificar se o post existe antes de listar
  const post = await prisma.post.findUnique({
    where: { id: postId },
  });

  if (!post) {
    throw { status: 404, message: "Post não encontrado" };
  }

  // Listar comentários do mais recente para o mais antigo
  return prisma.comment.findMany({
    where: { postId },
    orderBy: { createdAt: "desc" },
  });
}
