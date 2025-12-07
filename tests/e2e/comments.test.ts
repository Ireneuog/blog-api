import { describe, it, expect, vi, afterEach } from "vitest";
import request from "supertest";

// Mock Prisma before importing app
import prismaMock from "../helpers/prismaMock";

vi.mock("../../src/prisma", () => ({ prisma: prismaMock }));

import app from "../../src/app";
import { prisma } from "../../src/prisma";

describe("Comments E2E", () => {
  const mockUserId = 1;
  const mockPostId = 1;
  const mockUserEmail = "user@example.com";

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("POST /comments/:postId", () => {
    it("should create a comment with valid data and auth", async () => {
      // Setup mock
      (prisma.post.findUnique as any).mockResolvedValue({ id: mockPostId });
      (prisma.comment.create as any).mockResolvedValue({
        id: 1,
        content: "Olá",
        userId: mockUserId,
        postId: mockPostId,
        createdAt: new Date(),
      });

      const res = await request(app)
        .post(`/comments/${mockPostId}`)
        .set("x-user-id", String(mockUserId))
        .set("x-user-email", mockUserEmail)
        .send({
          content: "Olá",
        });

      expect(res.status).toBe(201);
      expect(res.body).toHaveProperty("id");
      expect(res.body.content).toBe("Olá");
      expect(res.body.userId).toBe(mockUserId);
      expect(res.body.postId).toBe(mockPostId);
    });

    it("should return 401 without authentication headers", async () => {
      const res = await request(app)
        .post(`/comments/${mockPostId}`)
        .send({
          content: "Olá",
        });

      expect(res.status).toBe(401);
      expect(res.body).toHaveProperty("error");
      expect(res.body.code).toBe("UNAUTHORIZED");
    });

    it("should return 400 when content is empty", async () => {
      (prisma.post.findUnique as any).mockResolvedValue({ id: mockPostId });

      const res = await request(app)
        .post(`/comments/${mockPostId}`)
        .set("x-user-id", String(mockUserId))
        .set("x-user-email", mockUserEmail)
        .send({
          content: "",
        });

      expect(res.status).toBe(400);
      expect(res.body).toHaveProperty("error");
      expect(res.body.code).toBe("VALIDATION_ERROR");
    });

    it("should return 404 when post does not exist", async () => {
      (prisma.post.findUnique as any).mockResolvedValue(null);

      const res = await request(app)
        .post(`/comments/${mockPostId}`)
        .set("x-user-id", String(mockUserId))
        .set("x-user-email", mockUserEmail)
        .send({
          content: "Olá",
        });

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty("error");
      expect(res.body.code).toBe("NOT_FOUND");
    });
  });

  describe("GET /comments/:postId", () => {
    it("should list comments for a post", async () => {
      const mockComments = [
        {
          id: 2,
          content: "Second comment",
          userId: 2,
          postId: mockPostId,
          createdAt: new Date("2024-01-02"),
        },
        {
          id: 1,
          content: "First comment",
          userId: 1,
          postId: mockPostId,
          createdAt: new Date("2024-01-01"),
        },
      ];

      (prisma.post.findUnique as any).mockResolvedValue({ id: mockPostId });
      (prisma.comment.findMany as any).mockResolvedValue(mockComments);

      const res = await request(app).get(`/comments/${mockPostId}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body).toHaveLength(2);
      expect(res.body[0].id).toBe(2); // Most recent first
      expect(res.body[0].content).toBe("Second comment");
    });

    it("should return 404 when post does not exist", async () => {
      (prisma.post.findUnique as any).mockResolvedValue(null);

      const res = await request(app).get(`/comments/${mockPostId}`);

      expect(res.status).toBe(404);
      expect(res.body).toHaveProperty("error");
      expect(res.body.code).toBe("NOT_FOUND");
    });

    it("should return empty array when post has no comments", async () => {
      (prisma.post.findUnique as any).mockResolvedValue({ id: mockPostId });
      (prisma.comment.findMany as any).mockResolvedValue([]);

      const res = await request(app).get(`/comments/${mockPostId}`);

      expect(res.status).toBe(200);
      expect(Array.isArray(res.body)).toBe(true);
      expect(res.body).toHaveLength(0);
    });
  });
});
