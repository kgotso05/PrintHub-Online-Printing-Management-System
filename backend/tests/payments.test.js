
const request = require("supertest");
const app = require("../src/server");
const pool = require("../src/config/db");

describe("PrintHub Payment API Security", () => {
  afterAll(async () => {
    await pool.end();
  });

  test("GET /api/payments/order/11 rejects requests without a token", async () => {
    const response = await request(app)
      .get("/api/payments/order/11");

    expect(response.status).toBe(401);
  });

  test("GET /api/admin/payments rejects requests without a token", async () => {
    const response = await request(app)
      .get("/api/admin/payments");

    expect(response.status).toBe(401);
  });

  test("POST /api/payments rejects requests without a token", async () => {
    const response = await request(app)
      .post("/api/payments")
      .send({
        order_id: 11,
        amount: 65,
        payment_method: "EFT"
      });

    expect(response.status).toBe(401);
  });
  
test("GET /api/admin/payments rejects a normal customer", async () => {
  const loginResponse = await request(app)
    .post("/api/auth/login")
    .send({
      email: "testcustomer@example.com",
      password: "TestPass123!"
    });

  expect(loginResponse.status).toBe(200);
  expect(loginResponse.body.token).toBeDefined();

  const response = await request(app)
    .get("/api/admin/payments")
    .set("Authorization", `Bearer ${loginResponse.body.token}`);

  expect(response.status).toBe(403);
});

test("GET /api/payments/order/11 prevents another customer from viewing payments", async () => {
  const loginResponse = await request(app)
    .post("/api/auth/login")
    .send({
      email: "securitytest@printhub.local",
      password: "TestPass456!"
    });

  expect(loginResponse.status).toBe(200);
  expect(loginResponse.body.token).toBeDefined();

  const response = await request(app)
    .get("/api/payments/order/11")
    .set("Authorization", `Bearer ${loginResponse.body.token}`);

  expect(response.status).toBe(404);
});


});
