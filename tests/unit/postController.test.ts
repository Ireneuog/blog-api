import { describe, it, expect, vi, beforeEach } from "vitest";
import { updatePost, deletePost } from "../../src/controllers/postController";
import * as postService from "../../src/services/postService";
import { AuthenticatedRequest } from "../../src/types/request";
import { Response } from "express";
import {
  ValidationError,
  ForbiddenError,
  NotFoundError,
} from "../../src/types/errors";

vi.mock("../../src/services/postService");

describe("Post Controller", () => {
  let mockReq: Partial<AuthenticatedRequest>;
  let mockRes: Partial<Response>;

  beforeEach(() => {
    vi.clearAllMocks();

    mockReq = {
      params: { id: "1" },
      body: { title: "Test Title", content: "Test content" },
      user: { userId: 1, email: "user@example.com" },
    };

    mockRes = {
      status: vi.fn().mockReturnThis(),
      json: vi.fn().mockReturnThis(),
      send: vi.fn().mockReturnThis(),
    };
  });

  describe("updatePost", () => {
    it("should update a post successfully", async () => {
      const mockPost = {
        id: 1,
        title: "Updated Title",
        content: "Updated content",
        userId: 1,
        createdAt: new Date(),
      };

      (postService.updatePost as any).mockResolvedValue(mockPost);

      await updatePost(mockReq as AuthenticatedRequest, mockRes as Response);

      expect(postService.updatePost).toHaveBeenCalledWith(
        1,
        1,
        "Test Title",
        "Test content"
      );
      expect(mockRes.json).toHaveBeenCalledWith(mockPost);
    });

    it("should propagate ValidationError from service", async () => {
      (postService.updatePost as any).mockRejectedValue(
        new ValidationError("Title and content are required")
      );

      await expect(
        updatePost(mockReq as AuthenticatedRequest, mockRes as Response)
      ).rejects.toThrow(ValidationError);
    });

    it("should propagate ForbiddenError from service", async () => {
      (postService.updatePost as any).mockRejectedValue(
        new ForbiddenError("You cannot edit this post")
      );

      await expect(
        updatePost(mockReq as AuthenticatedRequest, mockRes as Response)
      ).rejects.toThrow(ForbiddenError);
    });

    it("should propagate NotFoundError from service", async () => {
      (postService.updatePost as any).mockRejectedValue(
        new NotFoundError("Post not found")
      );

      await expect(
        updatePost(mockReq as AuthenticatedRequest, mockRes as Response)
      ).rejects.toThrow(NotFoundError);
    });

    it("should use authenticated user ID from request", async () => {
      mockReq.user = { userId: 42, email: "admin@example.com" };
      (postService.updatePost as any).mockResolvedValue({ id: 1 });

      await updatePost(mockReq as AuthenticatedRequest, mockRes as Response);

      expect(postService.updatePost).toHaveBeenCalledWith(
        1,
        42, // User ID from authenticated request
        "Test Title",
        "Test content"
      );
    });
  });

  describe("deletePost", () => {
    it("should delete a post successfully", async () => {
      (postService.deletePost as any).mockResolvedValue(undefined);

      await deletePost(mockReq as AuthenticatedRequest, mockRes as Response);

      expect(postService.deletePost).toHaveBeenCalledWith(1, 1);
      expect(mockRes.status).toHaveBeenCalledWith(204);
      expect(mockRes.send).toHaveBeenCalled();
    });

    it("should propagate ForbiddenError from service", async () => {
      (postService.deletePost as any).mockRejectedValue(
        new ForbiddenError("You cannot delete this post")
      );

      await expect(
        deletePost(mockReq as AuthenticatedRequest, mockRes as Response)
      ).rejects.toThrow(ForbiddenError);
    });

    it("should propagate NotFoundError from service", async () => {
      (postService.deletePost as any).mockRejectedValue(
        new NotFoundError("Post not found")
      );

      await expect(
        deletePost(mockReq as AuthenticatedRequest, mockRes as Response)
      ).rejects.toThrow(NotFoundError);
    });

    it("should use authenticated user ID from request", async () => {
      mockReq.user = { userId: 42, email: "admin@example.com" };
      (postService.deletePost as any).mockResolvedValue(undefined);

      await deletePost(mockReq as AuthenticatedRequest, mockRes as Response);

      expect(postService.deletePost).toHaveBeenCalledWith(
        1,
        42 // User ID from authenticated request
      );
    });

    it("should return 204 No Content on success", async () => {
      (postService.deletePost as any).mockResolvedValue(undefined);

      await deletePost(mockReq as AuthenticatedRequest, mockRes as Response);

      expect(mockRes.status).toHaveBeenCalledWith(204);
      expect(mockRes.send).toHaveBeenCalledWith();
    });
  });
});
