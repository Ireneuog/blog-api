import { vi } from "vitest";

export const prismaMock = {
  post: {
    findUnique: vi.fn(),
    update: vi.fn(),
    delete: vi.fn(),
  },
  comment: {
    create: vi.fn(),
    findMany: vi.fn(),
    deleteMany: vi.fn(),
  },
};

export default prismaMock;
