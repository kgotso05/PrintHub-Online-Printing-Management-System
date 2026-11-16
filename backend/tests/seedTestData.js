
const path = require("path");
const dotenv = require("dotenv");
const bcrypt = require("bcrypt");

dotenv.config({
  path: path.resolve(__dirname, "../.env.test"),
  override: true
});

if (
  process.env.NODE_ENV !== "test" ||
  process.env.DB_NAME !== "printhub_test"
) {
  throw new Error("Safety check: test database required.");
}

const pool = require("../src/config/db");

async function seed() {
  const connection = await pool.getConnection();

  try {
    await connection.beginTransaction();

    const accounts = [
      {
        name: "Test Customer",
        email: "testcustomer@example.com",
        password: "TestPass123!",
        role: "customer"
      },
      {
        name: "Security Test",
        email: "securitytest@printhub.local",
        password: "TestPass456!",
        role: "customer"
      },
      {
        name: "Test Administrator",
        email: "admin@printhub.local",
        password: "AdminTest123!",
        role: "admin"
      }
    ];

    const customerIds = {};

    for (const account of accounts) {
      const passwordHash = await bcrypt.hash(
        account.password,
        10
      );

      const [existing] = await connection.execute(
        "SELECT customer_id FROM customers WHERE email = ?",
        [account.email]
      );

      if (existing.length > 0) {
        await connection.execute(
          `UPDATE customers
           SET full_name = ?, password_hash = ?, role = ?
           WHERE customer_id = ?`,
          [
            account.name,
            passwordHash,
            account.role,
            existing[0].customer_id
          ]
        );

        customerIds[account.email] =
          existing[0].customer_id;
      } else {
        const [result] = await connection.execute(
          `INSERT INTO customers
           (full_name, email, password_hash, role)
           VALUES (?, ?, ?, ?)`,
          [
            account.name,
            account.email,
            passwordHash,
            account.role
          ]
        );

        customerIds[account.email] = result.insertId;
      }
    }

    await connection.execute(
      `INSERT INTO categories
       (category_id, category_name, description)
       VALUES (1, 'Printing', 'Test printing category')
       ON DUPLICATE KEY UPDATE
       category_name = VALUES(category_name)`
    );

    await connection.execute(
      `INSERT INTO services
       (service_id, category_id, service_name, base_price)
       VALUES (1, 1, 'Document Printing', 65.00)
       ON DUPLICATE KEY UPDATE
       service_name = VALUES(service_name),
       base_price = VALUES(base_price)`
    );

    const ownerId =
      customerIds["testcustomer@example.com"];

    await connection.execute(
      `INSERT INTO orders
       (order_id, customer_id, order_status, total_amount)
       VALUES (11, ?, 'Confirmed', 65.00)
       ON DUPLICATE KEY UPDATE
       customer_id = VALUES(customer_id),
       order_status = VALUES(order_status),
       total_amount = VALUES(total_amount)`,
      [ownerId]
    );

    const [items] = await connection.execute(
      `SELECT order_item_id
       FROM order_items
       WHERE order_id = 11 AND service_id = 1
       LIMIT 1`
    );

    if (items.length === 0) {
      await connection.execute(
        `INSERT INTO order_items
         (order_id, service_id, quantity, unit_price)
         VALUES (11, 1, 1, 65.00)`
      );
    }

    await connection.commit();

    console.log("Test data seeded successfully.");
    console.log("Test customer ID:", ownerId);
    console.log("Test order ID: 11");
  } catch (error) {
    await connection.rollback();
    throw error;
  } finally {
    connection.release();
    await pool.end();
  }
}

seed().catch((error) => {
  console.error("Test database seed failed:", error);
  process.exitCode = 1;
});
