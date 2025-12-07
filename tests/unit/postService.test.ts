import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock Prisma before importing services
import prismaMock from "../helpers/prismaMock";

vi.mock("../../src/prisma", () => ({ prisma: prismaMock }));

import { updatePost, deletePost } from "../../src/services/postService";
import { prisma } from "../../src/prisma";
import { ValidationError, ForbiddenError, NotFoundError } from "../../src/types/errors";

describe("post service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("updatePost", () => {
    it("should update a post", async () => {
      (prisma.post.findUnique as any).mockResolvedValue({ id: 1, userId: 1 });
      (prisma.post.update as any).mockResolvedValue({
        id: 1,
        title: "Updated",
        content: "Updated content",
        userId: 1,
      });

      const res = await updatePost(1, 1, "Updated", "Updated content");
      expect(res.title).toBe("Updated");
    });

    it("should throw ValidationError when title is missing", async () => {
      await expect(updatePost(1, 1, "", "content")).rejects.toThrow(ValidationError);
    });

    it("should throw ValidationError when content is missing", async () => {
      await expect(updatePost(1, 1, "title", "")).rejects.toThrow(ValidationError);
    });

    it("should throw NotFoundError when post does not exist", async () => {
      (prisma.post.findUnique as any).mockResolvedValue(null);

      await expect(updatePost(1, 1, "title", "content")).rejects.toThrow(NotFoundError);
    });

    it("should throw ForbiddenError when user is not the post owner", async () => {
      (prisma.post.findUnique as any).mockResolvedValue({ id: 1, userId: 2 });

      await expect(updatePost(1, 1, "title", "content")).rejects.toThrow(ForbiddenError);
    });
  });

  describe("deletePost", () => {
    it("should delete a post and its comments", async () => {
      (prisma.post.findUnique as any).mockResolvedValue({ id: 1, userId: 1 });
      (prisma.comment.deleteMany as any).mockResolvedValue({ count: 2 });
      (prisma.post.delete as any).mockResolvedValue({ id: 1 });

      await deletePost(1, 1);

      expect(prisma.comment.deleteMany).toHaveBeenCalledWith({ where: { postId: 1 } });
      expect(prisma.post.delete).toHaveBeenCalledWith({ where: { id: 1 } });
    });

    it("should throw NotFoundError when post does not exist", async () => {
      (prisma.post.findUnique as any).mockResolvedValue(null);

      await expect(deletePost(1, 1)).rejects.toThrow(NotFoundError);
    });

    it("should throw ForbiddenError when user is not the post owner", async () => {
      (prisma.post.findUnique as any).mockResolvedValue({ id: 1, userId: 2 });

      await expect(deletePost(1, 1)).rejects.toThrow(ForbiddenError);
    });
  });
});
