import { describe, it, expect, vi, beforeEach } from "vitest";

// Mock Prisma before importing services
import prismaMock from "../helpers/prismaMock";

vi.mock("../../src/prisma", () => ({ prisma: prismaMock }));

import { createComment, listComments } from "../../src/services/commentService";
import { prisma } from "../../src/prisma";
import { UnauthorizedError, ValidationError, NotFoundError } from "../../src/types/errors";

describe("comment service", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("createComment", () => {
    it("should create a comment", async () => {
      (prisma.post.findUnique as any).mockResolvedValue({ id: 1 });
      (prisma.comment.create as any).mockResolvedValue({
        id: 1,
        content: "Hello",
        userId: 1,
        postId: 1,
      });

      const res = await createComment(1, 1, "Hello");
      expect(res.id).toBe(1);
    });

    it("should throw UnauthorizedError when userId is missing", async () => {
      await expect(createComment(1, 0, "Hello")).rejects.toThrow(UnauthorizedError);
    });

    it("should throw ValidationError when content is empty", async () => {
      await expect(createComment(1, 1, "")).rejects.toThrow(ValidationError);
    });

    it("should throw NotFoundError when post does not exist", async () => {
      (prisma.post.findUnique as any).mockResolvedValue(null);

      await expect(createComment(1, 1, "Hello")).rejects.toThrow(NotFoundError);
    });
  });

  describe("listComments", () => {
    it("should list comments ordered by createdAt desc", async () => {
      (prisma.post.findUnique as any).mockResolvedValue({ id: 1 });
      (prisma.comment.findMany as any).mockResolvedValue([
        { id: 2, content: "Second", createdAt: new Date("2024-01-02") },
        { id: 1, content: "First", createdAt: new Date("2024-01-01") },
      ]);

      const res = await listComments(1);
      expect(res).toHaveLength(2);
      expect(res[0].id).toBe(2);
    });

    it("should throw NotFoundError when post does not exist", async () => {
      (prisma.post.findUnique as any).mockResolvedValue(null);

      await expect(listComments(1)).rejects.toThrow(NotFoundError);
    });
  });
});
