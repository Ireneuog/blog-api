import { Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware.ts";
import { createComment, listComments } from "../controllers/commentController.ts";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router();

// Criar comentário 
router.post("/:postId", authMiddleware, asyncHandler(createComment));

// Listar comentários de um post
router.get("/:postId", asyncHandler(listComments));

export default router;
