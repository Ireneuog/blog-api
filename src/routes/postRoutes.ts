import { Router } from "express";
import { authMiddleware } from "../middlewares/authMiddleware";
import { updatePost, deletePost } from "../controllers/postController";
import { asyncHandler } from "../utils/asyncHandler";

const router = Router();

/**
 * All post routes require authentication
 */
router.use(authMiddleware);

router.put("/:id", asyncHandler(updatePost));
router.delete("/:id", asyncHandler(deletePost));

export default router;
