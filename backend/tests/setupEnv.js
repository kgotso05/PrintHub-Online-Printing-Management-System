
const path = require("path");
const dotenv = require("dotenv");

const envPath = path.resolve(__dirname, "../.env.test");

const result = dotenv.config({
  path: envPath,
  override: true
});

if (result.error) {
  throw new Error(
    `Unable to load test environment: ${result.error.message}`
  );
}

if (process.env.NODE_ENV !== "test") {
  throw new Error("Jest must run in the test environment.");
}

if (process.env.DB_NAME !== "printhub_test") {
  throw new Error(
    "Safety check failed: Jest must use printhub_test."
  );
}

console.log("Jest environment:", process.env.NODE_ENV);
console.log("Jest database:", process.env.DB_NAME);
