
const request = require("supertest");
const app = require("../src/server");
const pool = require("../src/config/db");

describe("PrintHub Order API Security", () => {
  afterAll(async () => {
    await pool.end();
  });

  test("GET /api/orders/my rejects requests without a token", async () => {
    const response = await request(app)
      .get("/api/orders/my");

    expect(response.status).toBe(401);
  });

  test("GET /api/orders/11 rejects requests without a token", async () => {
    const response = await request(app)
      .get("/api/orders/11");

    expect(response.status).toBe(401);
  });

  test("GET /api/orders/11 allows the order owner", async () => {
    const loginResponse = await request(app)
      .post("/api/auth/login")
      .send({
        email: "testcustomer@example.com",
        password: "TestPass123!"
      });

    expect(loginResponse.status).toBe(200);

    const token = loginResponse.body.token;

    const response = await request(app)
      .get("/api/orders/11")
      .set("Authorization", `Bearer ${token}`);

    expect(response.status).toBe(200);
  });
  
test("GET /api/orders/11 prevents another customer from accessing the order", async () => {
  const loginResponse = await request(app)
    .post("/api/auth/login")
    .send({
      email: "securitytest@printhub.local",
      password: "TestPass456!"
    });

  expect(loginResponse.status).toBe(200);
  expect(loginResponse.body.token).toBeDefined();

  const token = loginResponse.body.token;

  const response = await request(app)
    .get("/api/orders/11")
    .set("Authorization", `Bearer ${token}`);

  expect(response.status).toBe(404);
});

});
