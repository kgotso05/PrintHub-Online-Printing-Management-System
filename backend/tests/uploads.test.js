
const request = require("supertest");
const app = require("../src/server");
const pool = require("../src/config/db");


const fs = require("fs");
const path = require("path");

beforeAll(async () => {
  const loginResponse = await request(app)
    .post("/api/auth/login")
    .send({
      email: "testcustomer@example.com",
      password: "TestPass123!"
    });

  if (loginResponse.status !== 200) {
    throw new Error("Test customer login failed.");
  }

  const pdfPath = path.join(
    __dirname,
    "fixtures",
    "PrintHub-Test1.pdf"
  );

  if (!fs.existsSync(pdfPath)) {
    throw new Error("PDF test fixture is missing.");
  }

  const response = await request(app)
    .post("/api/orders/11/uploads")
    .set(
      "Authorization",
      `Bearer ${loginResponse.body.token}`
    )
    .attach("document", pdfPath);

  if (response.status !== 201) {
    throw new Error(
      `PDF fixture upload failed: ${response.status} ${JSON.stringify(response.body)}`
    );
  }
});


describe("PrintHub Document Security", () => {
  afterAll(async () => {
    await pool.end();
  });

  test("GET /api/orders/11/uploads requires authentication", async () => {
    const response = await request(app)
      .get("/api/orders/11/uploads");

    expect(response.status).toBe(401);
  });

  test("POST /api/orders/11/uploads requires authentication", async () => {
    const response = await request(app)
      .post("/api/orders/11/uploads");

    expect(response.status).toBe(401);
  });

  test("GET document download requires authentication", async () => {
    const response = await request(app)
      .get("/api/orders/11/uploads/999999/download");

    expect(response.status).toBe(401);
  });
  
test("Order owner can view their uploaded documents", async () => {
  const loginResponse = await request(app)
    .post("/api/auth/login")
    .send({
      email: "testcustomer@example.com",
      password: "TestPass123!"
    });

  expect(loginResponse.status).toBe(200);

  const response = await request(app)
    .get("/api/orders/11/uploads")
    .set("Authorization", `Bearer ${loginResponse.body.token}`);

  expect(response.status).toBe(200);
  expect(Array.isArray(response.body.documents)).toBe(true);
});

test("Another customer cannot view the order's documents", async () => {
  const loginResponse = await request(app)
    .post("/api/auth/login")
    .send({
      email: "securitytest@printhub.local",
      password: "TestPass456!"
    });

  expect(loginResponse.status).toBe(200);

  const response = await request(app)
    .get("/api/orders/11/uploads")
    .set("Authorization", `Bearer ${loginResponse.body.token}`);

  expect(response.status).toBe(404);
});

test("Order owner can download their uploaded PDF", async () => {
  const loginResponse = await request(app)
    .post("/api/auth/login")
    .send({
      email: "testcustomer@example.com",
      password: "TestPass123!"
    });

  expect(loginResponse.status).toBe(200);

  const token = loginResponse.body.token;

  const documentsResponse = await request(app)
    .get("/api/orders/11/uploads")
    .set("Authorization", `Bearer ${token}`);

  expect(documentsResponse.status).toBe(200);

  const document = documentsResponse.body.documents.find(
    (item) => item.file_name === "PrintHub-Test1.pdf"
  );

  expect(document).toBeDefined();

  const response = await request(app)
    .get(`/api/orders/11/uploads/${document.upload_id}/download`)
    .set("Authorization", `Bearer ${token}`);

  expect(response.status).toBe(200);
  expect(response.headers["content-disposition"]).toContain("attachment");
});

test("Another customer cannot download the order owner's PDF", async () => {
  const loginResponse = await request(app)
    .post("/api/auth/login")
    .send({
      email: "securitytest@printhub.local",
      password: "TestPass456!"
    });

  expect(loginResponse.status).toBe(200);

  const response = await request(app)
    .get("/api/orders/11/uploads/999999/download")
    .set("Authorization", `Bearer ${loginResponse.body.token}`);

  expect(response.status).toBe(404);
});


test("Rejects a fake PDF with HTTP 400", async () => {
  const loginResponse = await request(app)
    .post("/api/auth/login")
    .send({
      email: "testcustomer@example.com",
      password: "TestPass123!"
    });

  expect(loginResponse.status).toBe(200);

  const fakePdf = Buffer.from(
    "This is a text file pretending to be a PDF."
  );

  const response = await request(app)
    .post("/api/orders/11/uploads")
    .set("Authorization", `Bearer ${loginResponse.body.token}`)
    .attach("document", fakePdf, {
      filename: "Fake-Automated-Test.pdf",
      contentType: "application/pdf"
    });

  expect(response.status).toBe(400);
  expect(response.body.message).toMatch(/invalid file/i);
});


test("Rejects files larger than 10 MB with HTTP 413", async () => {
  const loginResponse = await request(app)
    .post("/api/auth/login")
    .send({
      email: "testcustomer@example.com",
      password: "TestPass123!"
    });

  expect(loginResponse.status).toBe(200);

  const oversizedFile = Buffer.alloc(
    11 * 1024 * 1024,
    0
  );

  const response = await request(app)
    .post("/api/orders/11/uploads")
    .set("Authorization", `Bearer ${loginResponse.body.token}`)
    .attach("document", oversizedFile, {
      filename: "Oversized-Test.pdf",
      contentType: "application/pdf"
    });

  expect(response.status).toBe(413);
  expect(response.body.message).toMatch(/10 MB/i);
});


test("Rejects unsupported TXT files with HTTP 400", async () => {
  const loginResponse = await request(app)
    .post("/api/auth/login")
    .send({
      email: "testcustomer@example.com",
      password: "TestPass123!"
    });

  expect(loginResponse.status).toBe(200);

  const textFile = Buffer.from(
    "This text file should not be accepted by PrintHub."
  );

  const response = await request(app)
    .post("/api/orders/11/uploads")
    .set("Authorization", `Bearer ${loginResponse.body.token}`)
    .attach("document", textFile, {
      filename: "Unsupported-Automated-Test.txt",
      contentType: "text/plain"
    });

  expect(response.status).toBe(400);
  expect(response.body.message).toBeDefined();
});


});
