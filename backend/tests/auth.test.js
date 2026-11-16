
const request = require("supertest");
const app = require("../src/server");
const pool = require("../src/config/db");

describe("PrintHub Authentication Security", () => {

  afterAll(async () => {
    await pool.end();
  });

  test("GET /api/customers/me should reject requests without a token", async () => {
    const response = await request(app)
      .get("/api/customers/me");

    expect(response.status).toBe(401);
  });

  test("GET /api/orders/my should reject requests without a token", async () => {
    const response = await request(app)
      .get("/api/orders/my");

    expect(response.status).toBe(401);
  });

  test("GET /api/admin/orders should reject requests without a token", async () => {
    const response = await request(app)
      .get("/api/admin/orders");

    expect(response.status).toBe(401);
  });

  
test("POST /api/auth/login should accept valid credentials", async () => {
  const response = await request(app)
    .post("/api/auth/login")
    .send({
      email: "testcustomer@example.com",
      password: "TestPass123!"
    });

  expect(response.status).toBe(200);
  expect(response.body.token).toBeDefined();
  expect(typeof response.body.token).toBe("string");
});

test("POST /api/auth/login should reject an incorrect password", async () => {
  const response = await request(app)
    .post("/api/auth/login")
    .send({
      email: "testcustomer@example.com",
      password: "WrongPassword123!"
    });

  expect([400, 401]).toContain(response.status);
  expect(response.body.token).toBeUndefined();
});


test("GET /api/customers/me should allow a logged-in customer", async () => {
  const loginResponse = await request(app)
    .post("/api/auth/login")
    .send({
      email: "testcustomer@example.com",
      password: "TestPass123!"
    });

  expect(loginResponse.status).toBe(200);

  const token = loginResponse.body.token;
  expect(token).toBeDefined();

  const response = await request(app)
    .get("/api/customers/me")
    .set("Authorization", `Bearer ${token}`);

  expect(response.status).toBe(200);
  expect(response.body).toBeDefined();
});

});
