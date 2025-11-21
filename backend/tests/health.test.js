const request = require("supertest");
const app = require("../../src/app").default;

describe("Health Check", () => {
  it("deve devolver status ok", async () => {
    const response = await request(app).get("/health");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: "ok" });
  });
});
