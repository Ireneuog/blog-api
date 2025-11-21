import { Request, Response } from "express";
import { prisma } from "../prisma/client";

export async function updatePost(req: Request, res: Response) {
  try {
    const postId = Number(req.params.id);
    const { title, content } = req.body;

    const userId = 1; 

    if (!title || !content) {
      return res.status(400).json({ error: "Título e conteúdo são obrigatórios" });
    }

    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (!post) {
      return res.status(404).json({ error: "Post não encontrado" });
    }

    if (post.userId !== userId) {
      return res.status(403).json({
        error: "Não tens permissão para editar este post",
      });
    }

    const updated = await prisma.post.update({
      where: { id: postId },
      data: { title, content },
    });

    return res.json(updated);
  } catch (err: any) {
    return res.status(500).json({
      error: err.message || "Erro ao editar post",
    });
  }
}

export async function deletePost(req: Request, res: Response) {
  try {
    const postId = Number(req.params.id);
    const userId = 1;

    const post = await prisma.post.findUnique({ where: { id: postId } });
    if (!post) {
      return res.status(404).json({ error: "Post não encontrado" });
    }

    if (post.userId !== userId) {
      return res.status(403).json({
        error: "Não tens permissão para apagar este post",
      });
    }

    // Apagar comentários ligados ao post
    await prisma.comment.deleteMany({ where: { postId } });

    // Apagar o post
    await prisma.post.delete({ where: { id: postId } });

    return res.status(204).send();
  } catch (err: any) {
    return res.status(500).json({
      error: err.message || "Erro ao apagar post",
    });
  }
}
