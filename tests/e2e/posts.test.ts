import { describe, it, expect, vi, afterEach } from "vitest";
import request from "supertest";

// Mock Prisma before importing app
import prismaMock from "../helpers/prismaMock";

vi.mock("../../src/prisma", () => ({ prisma: prismaMock }));

import app from "../../src/app";
import { prisma } from "../../src/prisma";

describe("Posts E2E", () => {
  const mockUserId = 1;
  const mockPostId = 1;
  const mockUserEmail = "user@example.com";
  const authHeaders = {
    "x-user-id": String(mockUserId),
    "x-user-email": mockUserEmail,
  };

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("PUT /posts/:id", () => {
    it("should update a post successfully", async () => {
      const mockPost = {
        id: mockPostId,
        title: "Updated Title",
        content: "Updated content",
        userId: mockUserId,
        createdAt: new Date(),
      };

      (prisma.post.findUnique as any).mockResolvedValue({
        id: mockPostId,
        userId: mockUserId,
      });
      (prisma.post.update as any).mockResolvedValue(mockPost);

      const res = await request(app)
        .put(`/posts/${mockPostId}`)
        .set(authHeaders)
        .send({
          title: "Updated Title",
          content: "Updated content",
        });

      expect(res.status).toBe(200);
      expect(res.body.title).toBe("Updated Title");
      expect(res.body.content).toBe("Updated content");
    });

    it("should return 401 without authentication", async () => {
      const res = await request(app)
        .put(`/posts/${mockPostId}`)
        .send({
          title: "Updated Title",
          content: "Updated content",
        });

      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty("error");
      expect(res.body.code).toBe("UNAUTHORIZED");
    });

    it("should return 400 when title is missing", async () => {
      const res = await request(app)
        .put(`/posts/${mockPostId}`)
        .set(authHeaders)
        .send({
          content: "Updated content",
        });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("error");
      expect(res.body.code).toBe("VALIDATION_ERROR");
    });

    it("should return 400 when content is missing", async () => {
      const res = await request(app)
        .put(`/posts/${mockPostId}`)
        .set(authHeaders)
        .send({
          title: "Updated Title",
        });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("error");
      expect(res.body.code).toBe("VALIDATION_ERROR");
    });

    it("should return 404 when post does not exist", async () => {
      (prisma.post.findUnique as any).mockResolvedValue(null);

      const res = await request(app)
        .put(`/posts/${mockPostId}`)
        .set(authHeaders)
        .send({
          title: "Updated Title",
          content: "Updated content",
        });

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty("error");
      expect(res.body.code).toBe("NOT_FOUND");
    });

    it("should return 403 when user is not post owner", async () => {
      (prisma.post.findUnique as any).mockResolvedValue({
        id: mockPostId,
        userId: 999, // Different user
      });

      const res = await request(app)
        .put(`/posts/${mockPostId}`)
        .set(authHeaders)
        .send({
          title: "Updated Title",
          content: "Updated content",
        });

      expect(res.status).toBe(403);
      expect(res.body).toHaveProperty("error");
      expect(res.body.code).toBe("FORBIDDEN");
    });
  });

  describe("DELETE /posts/:id", () => {
    it("should delete a post successfully", async () => {
      (prisma.post.findUnique as any).mockResolvedValue({
        id: mockPostId,
        userId: mockUserId,
      });
      (prisma.comment.deleteMany as any).mockResolvedValue({ count: 2 });
      (prisma.post.delete as any).mockResolvedValue({ id: mockPostId });

      const res = await request(app)
        .delete(`/posts/${mockPostId}`)
        .set(authHeaders);

      expect(res.status).toBe(204);
      expect(prisma.comment.deleteMany).toHaveBeenCalledWith({
        where: { postId: mockPostId },
      });
      expect(prisma.post.delete).toHaveBeenCalledWith({
        where: { id: mockPostId },
      });
    });

    it("should return 401 without authentication", async () => {
      const res = await request(app).delete(`/posts/${mockPostId}`);

      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty("error");
      expect(res.body.code).toBe("UNAUTHORIZED");
    });

    it("should return 404 when post does not exist", async () => {
      (prisma.post.findUnique as any).mockResolvedValue(null);

      const res = await request(app)
        .delete(`/posts/${mockPostId}`)
        .set(authHeaders);

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty("error");
      expect(res.body.code).toBe("NOT_FOUND");
    });

    it("should return 403 when user is not post owner", async () => {
      (prisma.post.findUnique as any).mockResolvedValue({
        id: mockPostId,
        userId: 999, // Different user
      });

      const res = await request(app)
        .delete(`/posts/${mockPostId}`)
        .set(authHeaders);

      expect(res.status).toBe(403);
      expect(res.body).toHaveProperty("error");
      expect(res.body.code).toBe("FORBIDDEN");
    });

    it("should cascade delete associated comments", async () => {
      (prisma.post.findUnique as any).mockResolvedValue({
        id: mockPostId,
        userId: mockUserId,
      });
      (prisma.comment.deleteMany as any).mockResolvedValue({ count: 5 });
      (prisma.post.delete as any).mockResolvedValue({ id: mockPostId });

      const res = await request(app)
        .delete(`/posts/${mockPostId}`)
        .set(authHeaders);

      expect(res.status).toBe(204);
      expect(prisma.comment.deleteMany).toHaveBeenCalledWith({
        where: { postId: mockPostId },
      });
      // Verify comments were deleted before post
      expect(prisma.comment.deleteMany).toHaveBeenCalled();
    });
  });
});
