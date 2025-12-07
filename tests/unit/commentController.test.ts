import { describe, it, expect, vi, beforeEach } from "vitest"; 
import { createComment, listComments } from "../../src/controllers/commentController.ts";
import * as commentService from "../../src/services/commentService.ts";
import { AuthenticatedRequest } from "../../src/types/request.ts";
import { Response } from "express";
import {
  ValidationError,
  UnauthorizedError,
  NotFoundError,
} from "../../src/types/errors";

vi.mock("../../src/services/commentService.ts");

describe("Comment Controller", () => {
  let mockReq: Partial<AuthenticatedRequest>;
  let mockRes: Partial<Response>;
  let mockNext: any;

  beforeEach(() => {
    vi.clearAllMocks();

    mockReq = {
      params: { postId: "1" },
      body: { content: "Test comment" },
      user: { userId: 1, email: "user@example.com" },
    };

    mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
    };

    mockNext = vi.fn();
  });

  describe("createComment", () => {
    it("should create a comment successfully", async () => {
      const mockComment = {
        id: 1,
        content: "Test comment",
        userId: 1,
        postId: 1,
        createdAt: new Date(),
      };

      (commentService.createComment as any).mockResolvedValue(mockComment);

      await createComment(
        mockReq as AuthenticatedRequest,
        mockRes as Response
      );

      expect(mockRes.status).toHaveBeenCalledWith(201);
      expect(mockRes.json).toHaveBeenCalledWith(mockComment);
      expect(commentService.createComment).toHaveBeenCalledWith(1, 1, "Test comment");
    });

    it("should throw UnauthorizedError when user is not authenticated", async () => {
      mockReq.user = undefined;

      await expect(
        createComment(mockReq as AuthenticatedRequest, mockRes as Response)
      ).rejects.toThrow(UnauthorizedError);
    });

    it("should throw ValidationError when content is empty", async () => {
      mockReq.body = { content: "" };

      await expect(
        createComment(mockReq as AuthenticatedRequest, mockRes as Response)
      ).rejects.toThrow(ValidationError);
    });

    it("should throw ValidationError when content is not provided", async () => {
      mockReq.body = {};

      await expect(
        createComment(mockReq as AuthenticatedRequest, mockRes as Response)
      ).rejects.toThrow(ValidationError);
    });

    it("should propagate service errors", async () => {
      (commentService.createComment as any).mockRejectedValue(
        new NotFoundError("Post não encontrado")
      );

      await expect(
        createComment(mockReq as AuthenticatedRequest, mockRes as Response)
      ).rejects.toThrow(NotFoundError);
    });
  });

  describe("listComments", () => {
    it("should list comments for a post", async () => {
      const mockComments = [
        {
          id: 2,
          content: "Second",
          userId: 1,
          postId: 1,
          createdAt: new Date("2024-01-02"),
        },
        {
          id: 1,
          content: "First",
          userId: 1,
          postId: 1,
          createdAt: new Date("2024-01-01"),
        },
      ];

      (commentService.listComments as any).mockResolvedValue(mockComments);

      await listComments(
        mockReq as AuthenticatedRequest,
        mockRes as Response
      );

      expect(mockRes.json).toHaveBeenCalledWith(mockComments);
      expect(commentService.listComments).toHaveBeenCalledWith(1);
    });

    it("should handle empty comment list", async () => {
      (commentService.listComments as any).mockResolvedValue([]);

      await listComments(
        mockReq as AuthenticatedRequest,
        mockRes as Response
      );

      expect(mockRes.json).toHaveBeenCalledWith([]);
    });

    it("should propagate service errors", async () => {
      (commentService.listComments as any).mockRejectedValue(
        new NotFoundError("Post não encontrado")
      );

      await expect(
        listComments(mockReq as AuthenticatedRequest, mockRes as Response)
      ).rejects.toThrow(NotFoundError);
    });

    it("should handle invalid postId parameter", async () => {
      mockReq.params = { postId: "invalid" };

      (commentService.listComments as any).mockResolvedValue([]);

      await listComments(
        mockReq as AuthenticatedRequest,
        mockRes as Response
      );

      // Should call with NaN (Number("invalid") = NaN)
      expect(commentService.listComments).toHaveBeenCalledWith(NaN);
    });
  });
});
