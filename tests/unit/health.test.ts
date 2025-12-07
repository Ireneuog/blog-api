import { describe, it, expect } from "vitest";
import request from "supertest";
import app from "../../src/app";

describe("Health Check", () => {
  it("deve devolver status ok", async () => {
    const response = await request(app).get("/health");

    expect(response.status).toBe(200);
    expect(response.body).toEqual({ status: "ok" });
  });

  it("deve retornar content-type application/json", async () => {
    const response = await request(app).get("/health");

    expect(response.headers["content-type"]).toMatch(/json/);
  });

  it("deve ter a propriedade status na resposta", async () => {
    const response = await request(app).get("/health");

    expect(response.body).toHaveProperty("status");
  });

  it("deve retornar status como string", async () => {
    const response = await request(app).get("/health");

    expect(typeof response.body.status).toBe("string");
  });

  it("deve ser acessível via GET", async () => {
    const response = await request(app).post("/health");

    expect(response.status).not.toBe(200);
  });
});
