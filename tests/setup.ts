import { vi } from "vitest";
import prismaMock from "./helpers/prismaMock";

// Mock the new wrapper module path used by source and tests. Include a few
// variants to be robust to how Vite/Vitest resolve module ids.
vi.mock("../src/prisma", () => ({ prisma: prismaMock }));
vi.mock("../../src/prisma", () => ({ prisma: prismaMock }));
vi.mock("src/prisma", () => ({ prisma: prismaMock }));
vi.mock("/src/prisma", () => ({ prisma: prismaMock }));

// Clear mocks after each test
afterEach(() => {
  vi.clearAllMocks();
});
