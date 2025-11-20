import { Request, Response } from "express";
import * as commentService from "../services/commentService";

export async function createComment(req: Request, res: Response) {
  try {
    const { postId } = req.params;
    const { content } = req.body;

    if (!content) {
      return res.status(400).json({ error: "O comentário não pode estar vazio." });
    }

    const userId = (req as any).user?.userId;

    if (!userId) {
      return res.status(401).json({ error: "Utilizador não autenticado." });
    }

    const comment = await commentService.createComment(
      Number(postId),
      userId,
      content
    );

    return res.status(201).json(comment);
  } catch (err: any) {
    return res.status(err.status || 500).json({ error: err.message });
  }
}

export async function listComments(req: Request, res: Response) {
  try {
    const { postId } = req.params;

    const comments = await commentService.listComments(Number(postId));
    return res.json(comments);
  } catch (err: any) {
    return res.status(err.status || 500).json({ error: err.message });
  }
}

