import { Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware";
import { createComment, listComments } from "../controllers/commentController";

const router = Router();

router.post("/:postId", authMiddleware, createComment);
router.get("/:postId", listComments);

export default router;
