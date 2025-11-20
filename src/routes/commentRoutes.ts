import { Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware";
import { createComment, listComments } from "../controllers/commentController";

const router = Router();

// Criar comentário 
router.post("/:postId", authMiddleware, createComment);

// Listar comentários de um post
router.get("/:postId", listComments);

export default router;
