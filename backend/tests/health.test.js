
const request = require("supertest");
const app = require("../src/server");
const pool = require("../src/config/db");

describe("PrintHub Health API", () => {
  afterAll(async () => {
    await pool.end();
  });

  test("GET /api/health should return HTTP 200", async () => {
    const response = await request(app).get("/api/health");

    expect(response.status).toBe(200);
  });
});
