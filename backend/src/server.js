require("dotenv").config();

const bcrypt = require("bcrypt");
const express = require("express");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const pool = require("./config/db");
const authenticateToken = require("./middleware/authMiddleware");
const requireAdmin = require("./middleware/adminMiddleware");
const upload = require("./middleware/uploadMiddleware");
const validateUpload = require("./middleware/validateUpload");
const fsPromises = require("fs/promises");
const crypto = require("crypto");
const multer = require("multer");
const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "PrintHub API is running"
  });
});

app.get("/api/health", async (req, res) => {
  try {
    const [rows] = await pool.query(
      "SELECT COUNT(*) AS total_customers FROM customers"
    );

    res.json({
      status: "success",
      database: "connected",
      total_customers: rows[0].total_customers
    });
  } catch (error) {
    console.error("Database connection failed:", error.message);

    res.status(500).json({
      status: "error",
      database: "disconnected"
    });
  }
});

const PORT = process.env.PORT || 5000;


app.get("/api/services", async (req, res) => {
  try {
    const [services] = await pool.query(`
      SELECT
        s.service_id,
        s.service_name,
        s.description,
        s.base_price,
        s.is_available,
        c.category_name
      FROM services s
      JOIN categories c
        ON s.category_id = c.category_id
      WHERE s.is_available = TRUE
      ORDER BY s.service_id
    `);

    res.json({
      status: "success",
      total_services: services.length,
      services: services
    });
  } catch (error) {
    console.error("Services API error:", error.message);

    res.status(500).json({
      status: "error",
      message: "Unable to retrieve printing services"
    });
  }
});


app.get(
  "/api/admin/services",
  authenticateToken,
  requireAdmin,
  async (req, res) => {
    try {
      const [services] = await pool.execute(`
        SELECT
          s.service_id,
          s.service_name,
          s.description,
          s.base_price,
          s.is_available,
          s.category_id,
          c.category_name
        FROM services s
        JOIN categories c
          ON s.category_id = c.category_id
        ORDER BY s.service_id
      `);

      return res.json({
        status: "success",
        total_services: services.length,
        services
      });

    } catch (error) {
      console.error("Admin services error:", error.message);

      return res.status(500).json({
        status: "error",
        message: "Unable to retrieve printing services"
      });
    }
  }
);


app.patch(
  "/api/admin/services/:serviceId",
  authenticateToken,
  requireAdmin,
  async (req, res) => {
    try {
      const serviceId = Number(req.params.serviceId);

      if (!Number.isSafeInteger(serviceId) || serviceId <= 0) {
        return res.status(400).json({
          status: "error",
          message: "Invalid service ID"
        });
      }

      const {
        service_name,
        description,
        base_price,
        is_available
      } = req.body || {};

      const updates = [];
      const values = [];

      if (service_name !== undefined) {
        if (
          typeof service_name !== "string" ||
          !service_name.trim() ||
          service_name.trim().length > 150
        ) {
          return res.status(400).json({
            status: "error",
            message: "Invalid service name"
          });
        }

        updates.push("service_name = ?");
        values.push(service_name.trim());
      }

      if (description !== undefined) {
        if (
          description !== null &&
          (typeof description !== "string" ||
           description.length > 2000)
        ) {
          return res.status(400).json({
            status: "error",
            message: "Invalid description"
          });
        }

        updates.push("description = ?");
        values.push(description);
      }

      if (base_price !== undefined) {
        const price = Number(base_price);

        if (
          base_price === null ||
          base_price === "" ||
          !Number.isFinite(price) ||
          price < 0 ||
          price > 999999.99
        ) {
          return res.status(400).json({
            status: "error",
            message: "Invalid service price"
          });
        }

        updates.push("base_price = ?");
        values.push(price.toFixed(2));
      }

      if (is_available !== undefined) {
        if (
          is_available !== true &&
          is_available !== false &&
          is_available !== 1 &&
          is_available !== 0
        ) {
          return res.status(400).json({
            status: "error",
            message: "Invalid availability value"
          });
        }

        updates.push("is_available = ?");
        values.push(Number(is_available));
      }

      if (updates.length === 0) {
        return res.status(400).json({
          status: "error",
          message: "No service changes provided"
        });
      }

      values.push(serviceId);

      const [result] = await pool.execute(
        `UPDATE services
         SET ${updates.join(", ")}
         WHERE service_id = ?`,
        values
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({
          status: "error",
          message: "Printing service not found"
        });
      }

      return res.json({
        status: "success",
        message: "Printing service updated successfully",
        service_id: serviceId
      });

    } catch (error) {
      console.error("Update service error:", error.message);

      return res.status(500).json({
        status: "error",
        message: "Unable to update printing service"
      });
    }
  }
);


app.post(
  "/api/admin/services",
  authenticateToken,
  requireAdmin,
  async (req, res) => {
    try {
      const {
        service_name,
        description,
        base_price,
        category_id
      } = req.body || {};

      if (
        typeof service_name !== "string" ||
        !service_name.trim() ||
        service_name.trim().length > 150
      ) {
        return res.status(400).json({
          status: "error",
          message: "A valid service name is required"
        });
      }

      if (
        description !== undefined &&
        description !== null &&
        (typeof description !== "string" ||
         description.length > 2000)
      ) {
        return res.status(400).json({
          status: "error",
          message: "Invalid description"
        });
      }

      const price = Number(base_price);

      if (
        base_price === undefined ||
        base_price === null ||
        base_price === "" ||
        !Number.isFinite(price) ||
        price < 0 ||
        price > 999999.99
      ) {
        return res.status(400).json({
          status: "error",
          message: "Enter a valid service price"
        });
      }

      const categoryId = Number(category_id);

      if (!Number.isSafeInteger(categoryId) || categoryId <= 0) {
        return res.status(400).json({
          status: "error",
          message: "Select a valid category"
        });
      }

      const [categories] = await pool.execute(
        "SELECT category_id FROM categories WHERE category_id = ?",
        [categoryId]
      );

      if (!categories.length) {
        return res.status(400).json({
          status: "error",
          message: "Selected category does not exist"
        });
      }

      const [result] = await pool.execute(
        `INSERT INTO services
         (service_name, description, base_price,
          category_id, is_available)
         VALUES (?, ?, ?, ?, 1)`,
        [
          service_name.trim(),
          description ?? "",
          price.toFixed(2),
          categoryId
        ]
      );

      return res.status(201).json({
        status: "success",
        message: "Printing service created successfully",
        service_id: result.insertId
      });

    } catch (error) {
      console.error("Create service error:", error.message);

      return res.status(500).json({
        status: "error",
        message: "Unable to create printing service"
      });
    }
  }
);


app.get(
  "/api/admin/categories",
  authenticateToken,
  requireAdmin,
  async (req, res) => {
    try {
      const [categories] = await pool.execute(
        `SELECT category_id, category_name
         FROM categories
         ORDER BY category_name`
      );

      return res.json({
        status: "success",
        categories
      });

    } catch (error) {
      console.error("Categories error:", error.message);

      return res.status(500).json({
        status: "error",
        message: "Unable to retrieve categories"
      });
    }
  }
);


app.post("/api/auth/register", async (req, res) => {
  try {
    const { full_name, email, password, phone } = req.body;

    if (
      typeof full_name !== "string" ||
      typeof email !== "string" ||
      typeof password !== "string" ||
      !full_name.trim() ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) ||
      password.length < 8 ||
      (phone != null && typeof phone !== "string")
    ) {
      return res.status(400).json({
        status: "error",
        message: "Provide a valid name, email and password of at least 8 characters"
      });
    }

    const cleanEmail = email.trim().toLowerCase();

    const passwordHash = await bcrypt.hash(password, 12);

    const [result] = await pool.execute(
      `INSERT INTO customers
       (full_name, email, password_hash, phone)
       VALUES (?, ?, ?, ?)`,
      [
        full_name.trim(),
        cleanEmail,
        passwordHash,
        phone?.trim() || null
      ]
    );

    res.status(201).json({
      status: "success",
      message: "Customer registered successfully",
      customer_id: result.insertId
    });

  } catch (error) {
    if (error.code === "ER_DUP_ENTRY") {
      return res.status(409).json({
        status: "error",
        message: "Email already registered"
      });
    }

    console.error("Registration error:", error.message);

    res.status(500).json({
      status: "error",
      message: "Registration failed"
    });
  }
});


app.post("/api/auth/login", async (req, res) => {
  try {
    const { email, password } = req.body || {};

    if (
      typeof email !== "string" ||
      typeof password !== "string" ||
      !email.trim() ||
      !password
    ) {
      return res.status(400).json({
        status: "error",
        message: "Email and password are required"
      });
    }

    const [customers] = await pool.execute(
      `SELECT customer_id, full_name, email, password_hash
       FROM customers
       WHERE email = ?
       LIMIT 1`,
      [email.trim().toLowerCase()]
    );

    if (customers.length === 0) {
      return res.status(401).json({
        status: "error",
        message: "Invalid email or password"
      });
    }

    const customer = customers[0];

    const validPassword = await bcrypt.compare(
      password,
      customer.password_hash
    );

    if (!validPassword) {
      return res.status(401).json({
        status: "error",
        message: "Invalid email or password"
      });
    }

    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is not configured");
    }

    const token = jwt.sign(
      {
        customer_id: customer.customer_id
      },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRES_IN || "1h",
        algorithm: "HS256"
      }
    );

    res.json({
      status: "success",
      message: "Login successful",
      token,
      customer: {
        customer_id: customer.customer_id,
        full_name: customer.full_name,
        email: customer.email
      }
    });

  } catch (error) {
    console.error("Login error:", error.message);

    res.status(500).json({
      status: "error",
      message: "Login failed"
    });
  }
});


app.get("/api/customers/me", authenticateToken, async (req, res) => {
  try {
    const [customers] = await pool.execute(
      `SELECT customer_id, full_name, email, phone, created_at
       FROM customers
       WHERE customer_id = ?`,
      [req.customer.customer_id]
    );

    if (customers.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "Customer not found"
      });
    }

    res.json({
      status: "success",
      customer: customers[0]
    });

  } catch (error) {
    console.error("Customer profile error:", error.message);

    res.status(500).json({
      status: "error",
      message: "Unable to retrieve customer profile"
    });
  }
});


app.get("/api/orders/my", authenticateToken, async (req, res) => {
  try {
    const [orders] = await pool.execute(
      `SELECT
         order_id,
         order_date,
         order_status,
         total_amount,
         special_instructions
       FROM orders
       WHERE customer_id = ?
       ORDER BY order_date DESC, order_id DESC`,
      [req.customer.customer_id]
    );

    res.json({
      status: "success",
      total_orders: orders.length,
      orders
    });

  } catch (error) {
    console.error("Customer orders error:", error.message);

    res.status(500).json({
      status: "error",
      message: "Unable to retrieve customer orders"
    });
  }
});


app.post("/api/orders", authenticateToken, async (req, res) => {
  const { items, special_instructions } = req.body || {};

  if (
    !Array.isArray(items) ||
    items.length === 0 ||
    items.length > 50 ||
    items.some(item =>
      !item ||
      !Number.isSafeInteger(item.service_id) ||
      item.service_id <= 0 ||
      !Number.isSafeInteger(item.quantity) ||
      item.quantity <= 0 ||
      item.quantity > 10000
    ) ||
    (special_instructions != null &&
      (typeof special_instructions !== "string" ||
       special_instructions.length > 2000))
  ) {
    return res.status(400).json({
      status: "error",
      message: "Provide valid printing services and quantities"
    });
  }

  let connection;

  try {
    connection = await pool.getConnection();
    await connection.beginTransaction();

    const orderItems = [];
    let totalCents = 0;

    for (const item of items) {
      const [services] = await connection.execute(
        `SELECT service_id, service_name, base_price
         FROM services
         WHERE service_id = ? AND is_available = TRUE`,
        [item.service_id]
      );

      if (services.length === 0) {
        await connection.rollback();

        return res.status(400).json({
          status: "error",
          message: "One of the selected services is unavailable"
        });
      }

      const service = services[0];
      const unitCents = Math.round(
        Number(service.base_price) * 100
      );

      const subtotalCents = unitCents * item.quantity;
      totalCents += subtotalCents;

      if (
        !Number.isSafeInteger(totalCents) ||
        totalCents > 9999999999
      ) {
        await connection.rollback();

        return res.status(400).json({
          status: "error",
          message: "Order amount exceeds the allowed limit"
        });
      }

      orderItems.push({
        service_id: service.service_id,
        service_name: service.service_name,
        quantity: item.quantity,
        unit_price: (unitCents / 100).toFixed(2),
        subtotal: (subtotalCents / 100).toFixed(2)
      });
    }

    const totalAmount = (totalCents / 100).toFixed(2);

    const [orderResult] = await connection.execute(
      `INSERT INTO orders
       (customer_id, order_status, total_amount,
        special_instructions)
       VALUES (?, 'Pending', ?, ?)`,
      [
        req.customer.customer_id,
        totalAmount,
        special_instructions?.trim() || null
      ]
    );

    const orderId = orderResult.insertId;

    for (const item of orderItems) {
      await connection.execute(
        `INSERT INTO order_items
         (order_id, service_id, quantity, unit_price)
         VALUES (?, ?, ?, ?)`,
        [
          orderId,
          item.service_id,
          item.quantity,
          item.unit_price
        ]
      );
    }

    await connection.commit();

    return res.status(201).json({
      status: "success",
      message: "Printing order placed successfully",
      order: {
        order_id: orderId,
        order_status: "Pending",
        total_amount: totalAmount,
        items: orderItems
      }
    });

  } catch (error) {
    if (connection) {
      try {
        await connection.rollback();
      } catch (rollbackError) {
        console.error("Rollback failed:", rollbackError.message);
      }
    }

    console.error("Order creation error:", error.message);

    return res.status(500).json({
      status: "error",
      message: "Unable to place printing order"
    });

  } finally {
    if (connection) {
      connection.release();
    }
  }
});


app.get("/api/orders/:orderId", authenticateToken, async (req, res) => {
  try {
    const orderId = Number(req.params.orderId);

    if (
      !Number.isSafeInteger(orderId) ||
      orderId <= 0
    ) {
      return res.status(400).json({
        status: "error",
        message: "Invalid order ID"
      });
    }

    const [orders] = await pool.execute(
      `SELECT
         order_id,
         customer_id,
         order_date,
         order_status,
         total_amount,
         special_instructions
       FROM orders
       WHERE order_id = ?
         AND customer_id = ?`,
      [orderId, req.customer.customer_id]
    );

    if (orders.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "Order not found"
      });
    }

    const [items] = await pool.execute(
      `SELECT
         oi.order_item_id,
         oi.service_id,
         s.service_name,
         oi.quantity,
         oi.unit_price,
         oi.subtotal
       FROM order_items oi
       JOIN services s
         ON oi.service_id = s.service_id
       WHERE oi.order_id = ?`,
      [orderId]
    );

    res.json({
      status: "success",
      order: {
        ...orders[0],
        items
      }
    });

  } catch (error) {
    console.error("Order details error:", error.message);

    res.status(500).json({
      status: "error",
      message: "Unable to retrieve order details"
    });
  }
});

// GET: Track the status of a customer's printing order

app.get("/api/orders/:orderId/status", authenticateToken, async (req, res) => {
  try {
    const orderId = Number(req.params.orderId);

    if (!Number.isSafeInteger(orderId) || orderId <= 0) {
      return res.status(400).json({
        status: "error",
        message: "Invalid order ID"
      });
    }

    const [orders] = await pool.execute(
      `SELECT order_id, order_status, order_date
       FROM orders
       WHERE order_id = ? AND customer_id = ?`,
      [orderId, req.customer.customer_id]
    );

    if (orders.length === 0) {
      return res.status(404).json({
        status: "error",
        message: "Order not found"
      });
    }

    return res.json({
      status: "success",
      order: orders[0]
    });

  } catch (error) {
    console.error("Order tracking error:", error.message);

    return res.status(500).json({
      status: "error",
      message: "Unable to retrieve order status"
    });
  }
});


app.get(
  "/api/admin/test",
  authenticateToken,
  requireAdmin,
  (req, res) => {
    res.json({
      status: "success",
      message: "Welcome to the PrintHub Administrator API",
      customer_id: req.customer.customer_id
    });
  }
);


app.get(
  "/api/admin/orders",
  authenticateToken,
  requireAdmin,
  async (req, res) => {
    try {
      const [orders] = await pool.execute(`
        SELECT
          o.order_id,
          o.order_date,
          o.order_status,
          o.total_amount,
          o.special_instructions,
          c.customer_id,
          c.full_name AS customer_name,
          c.email AS customer_email
        FROM orders o
        INNER JOIN customers c
          ON o.customer_id = c.customer_id
        ORDER BY o.order_date DESC, o.order_id DESC
      `);

      return res.json({
        status: "success",
        total_orders: orders.length,
        orders
      });

    } catch (error) {
      console.error("Admin orders error:", error.message);

      return res.status(500).json({
        status: "error",
        message: "Unable to retrieve orders"
      });
    }
  }
);


app.patch(
  "/api/admin/orders/:orderId/status",
  authenticateToken,
  requireAdmin,
  async (req, res) => {
    try {
      const orderId = Number(req.params.orderId);
      const { order_status } = req.body || {};

      const allowedTransitions = {
        Pending: ["Confirmed", "Cancelled"],
        Confirmed: ["Processing", "Cancelled"],
        Processing: ["Ready", "Cancelled"],
        Ready: ["Completed", "Cancelled"],
        Completed: [],
        Cancelled: []
      };

      if (!Number.isSafeInteger(orderId) || orderId <= 0) {
        return res.status(400).json({
          status: "error",
          message: "Invalid order ID"
        });
      }

      if (
        typeof order_status !== "string" ||
        !Object.hasOwn(allowedTransitions, order_status)
      ) {
        return res.status(400).json({
          status: "error",
          message: "Invalid order status"
        });
      }

      // Update only if the current status permits the transition.
      const currentStatuses = Object.entries(allowedTransitions)
        .filter(([, next]) => next.includes(order_status))
        .map(([current]) => current);

      if (currentStatuses.length === 0) {
        return res.status(409).json({
          status: "error",
          message: "This status cannot be assigned"
        });
      }

      const placeholders = currentStatuses.map(() => "?").join(", ");

      const [result] = await pool.execute(
        `UPDATE orders
         SET order_status = ?
         WHERE order_id = ?
         AND order_status IN (${placeholders})`,
        [order_status, orderId, ...currentStatuses]
      );

      if (result.affectedRows === 0) {
        const [orders] = await pool.execute(
          "SELECT order_status FROM orders WHERE order_id = ?",
          [orderId]
        );

        if (orders.length === 0) {
          return res.status(404).json({
            status: "error",
            message: "Order not found"
          });
        }

        return res.status(409).json({
          status: "error",
          message: `Cannot change order from ${orders[0].order_status} to ${order_status}`
        });
      }

      return res.json({
        status: "success",
        message: "Order status updated successfully",
        order_id: orderId,
        order_status
      });

    } catch (error) {
      console.error("Update order status error:", error.message);

      return res.status(500).json({
        status: "error",
        message: "Unable to update order status"
      });
    }
  }
);


app.post(
  "/api/payments",
  authenticateToken,
  async (req, res) => {
    let connection;

    try {
      const { order_id, payment_method } = req.body || {};
      const orderId = Number(order_id);

      const allowedMethods = ["Cash", "Card", "EFT"];

      if (!Number.isSafeInteger(orderId) || orderId <= 0) {
        return res.status(400).json({
          status: "error",
          message: "Invalid order ID"
        });
      }

      if (!allowedMethods.includes(payment_method)) {
        return res.status(400).json({
          status: "error",
          message: "Payment method must be Cash, Card or EFT"
        });
      }

      connection = await pool.getConnection();
      await connection.beginTransaction();

      // Lock the order to prevent concurrent payment creation.
      const [orders] = await connection.execute(
        `SELECT order_id, total_amount, order_status
         FROM orders
         WHERE order_id = ? AND customer_id = ?
         FOR UPDATE`,
        [orderId, req.customer.customer_id]
      );

      if (orders.length === 0) {
        await connection.rollback();

        return res.status(404).json({
          status: "error",
          message: "Order not found"
        });
      }

      const order = orders[0];

      if (["Cancelled", "Completed"].includes(order.order_status)) {
        await connection.rollback();

        return res.status(409).json({
          status: "error",
          message: "Payment cannot be initiated for this order"
        });
      }

      // Avoid creating duplicate payment records.
      const [existingPayments] = await connection.execute(
        `SELECT payment_id
         FROM payments
         WHERE order_id = ?
         LIMIT 1`,
        [orderId]
      );

      if (existingPayments.length > 0) {
        await connection.rollback();

        return res.status(409).json({
          status: "error",
          message: "A payment record already exists for this order"
        });
      }

      // The amount comes from MySQL, not from the customer.
      const [result] = await connection.execute(
        `INSERT INTO payments
           (order_id, amount, payment_method, payment_status)
         VALUES (?, ?, ?, 'Pending')`,
        [orderId, order.total_amount, payment_method]
      );

      await connection.commit();

      return res.status(201).json({
        status: "success",
        message: "Payment record created successfully",
        payment: {
          payment_id: result.insertId,
          order_id: orderId,
          amount: order.total_amount,
          payment_method,
          payment_status: "Pending"
        }
      });

    } catch (error) {
      if (connection) {
        try {
          await connection.rollback();
        } catch (rollbackError) {
          console.error("Payment rollback error:", rollbackError.message);
        }
      }

      console.error("Create payment error:", error.message);

      return res.status(500).json({
        status: "error",
        message: "Unable to create payment"
      });

    } finally {
      if (connection) {
        connection.release();
      }
    }
  }
);


app.get(
  "/api/payments/order/:orderId",
  authenticateToken,
  async (req, res) => {
    try {
      const orderId = Number(req.params.orderId);
      const customerId = req.customer.customer_id;

      if (!Number.isSafeInteger(orderId) || orderId <= 0) {
        return res.status(400).json({
          status: "error",
          message: "Invalid order ID"
        });
      }

      // Verify that the order belongs to this customer.
      const [orders] = await pool.execute(
        `SELECT order_id, total_amount, order_status
         FROM orders
         WHERE order_id = ? AND customer_id = ?`,
        [orderId, customerId]
      );

      if (orders.length === 0) {
        return res.status(404).json({
          status: "error",
          message: "Order not found"
        });
      }

      // Retrieve payment information for the order.
      const [payments] = await pool.execute(
        `SELECT
           payment_id,
           order_id,
           amount,
           payment_method,
           payment_status,
           transaction_reference,
           payment_date
         FROM payments
         WHERE order_id = ?
         ORDER BY payment_date DESC, payment_id DESC`,
        [orderId]
      );

      return res.json({
        status: "success",
        order: orders[0],
        total_payments: payments.length,
        payments
      });

    } catch (error) {
      console.error("Retrieve payment error:", error.message);

      return res.status(500).json({
        status: "error",
        message: "Unable to retrieve payment information"
      });
    }
  }
);


app.get(
  "/api/admin/payments",
  authenticateToken,
  requireAdmin,
  async (req, res) => {
    try {
      const [payments] = await pool.execute(`
        SELECT
          p.payment_id,
          p.order_id,
          p.amount,
          p.payment_method,
          p.payment_status,
          p.transaction_reference,
          p.payment_date,
          o.order_status,
          c.full_name AS customer_name,
          c.email AS customer_email
        FROM payments p
        INNER JOIN orders o ON p.order_id = o.order_id
        INNER JOIN customers c ON o.customer_id = c.customer_id
        ORDER BY p.payment_date DESC, p.payment_id DESC
      `);

      return res.json({
        status: "success",
        total_payments: payments.length,
        payments
      });

    } catch (error) {
      console.error("Admin payments error:", error.message);

      return res.status(500).json({
        status: "error",
        message: "Unable to retrieve payments"
      });
    }
  }
);


app.patch(
  "/api/admin/payments/:paymentId/status",
  authenticateToken,
  requireAdmin,
  async (req, res) => {
    try {
      const paymentId = Number(req.params.paymentId);
      const { payment_status, transaction_reference } = req.body || {};

      const allowedTransitions = {
        Pending: ["Successful", "Failed"],
        Successful: ["Refunded"],
        Failed: [],
        Refunded: []
      };

      if (!Number.isSafeInteger(paymentId) || paymentId <= 0) {
        return res.status(400).json({
          status: "error",
          message: "Invalid payment ID"
        });
      }

      if (
        typeof payment_status !== "string" ||
        !Object.hasOwn(allowedTransitions, payment_status)
      ) {
        return res.status(400).json({
          status: "error",
          message: "Invalid payment status"
        });
      }

      if (
        transaction_reference !== undefined &&
        transaction_reference !== null &&
        (
          typeof transaction_reference !== "string" ||
          transaction_reference.length > 150
        )
      ) {
        return res.status(400).json({
          status: "error",
          message: "Invalid transaction reference"
        });
      }

      const [payments] = await pool.execute(
        `SELECT payment_id, payment_status, transaction_reference
         FROM payments
         WHERE payment_id = ?`,
        [paymentId]
      );

      if (payments.length === 0) {
        return res.status(404).json({
          status: "error",
          message: "Payment not found"
        });
      }

      const currentStatus = payments[0].payment_status;

      if (!allowedTransitions[currentStatus]?.includes(payment_status)) {
        return res.status(409).json({
          status: "error",
          message: `Cannot change payment from ${currentStatus} to ${payment_status}`
        });
      }

      // Prevent conflicting updates by checking the old status.
      const [result] = await pool.execute(
        `UPDATE payments
         SET payment_status = ?,
             transaction_reference = COALESCE(?, transaction_reference)
         WHERE payment_id = ? AND payment_status = ?`,
        [
          payment_status,
          transaction_reference ?? null,
          paymentId,
          currentStatus
        ]
      );

      if (result.affectedRows === 0) {
        return res.status(409).json({
          status: "error",
          message: "Payment was modified by another request"
        });
      }

      return res.json({
        status: "success",
        message: "Payment status updated successfully",
        payment_id: paymentId,
        payment_status
      });

    } catch (error) {
      console.error("Update payment error:", error.message);

      return res.status(500).json({
        status: "error",
        message: "Unable to update payment status"
      });
    }
  }
);



app.post(
  "/api/orders/:orderId/uploads",
  authenticateToken,
  async (req, res, next) => {
    try {
      const orderId = Number(req.params.orderId);
      const customerId = req.customer.customer_id;

      if (!Number.isSafeInteger(orderId) || orderId <= 0) {
        return res.status(400).json({
          message: "Invalid order ID"
        });
      }

      const [orders] = await pool.query(
        `SELECT order_id, order_status
         FROM orders
         WHERE order_id = ? AND customer_id = ?`,
        [orderId, customerId]
      );

      if (orders.length === 0) {
        return res.status(404).json({
          message: "Order not found"
        });
      }

      if (!["Pending", "Confirmed"].includes(orders[0].order_status)) {
        return res.status(409).json({
          message: "Documents cannot be added at this order stage"
        });
      }

      next();

    } catch (error) {
      console.error("Upload authorization error:", error);

      return res.status(500).json({
        message: "Unable to authorize document upload"
      });
    }
  },

  (req, res, next) => {
  upload.single("document")(req, res, (err) => {
    if (err instanceof multer.MulterError) {
      if (err.code === "LIMIT_FILE_SIZE") {
        return res.status(413).json({
          message: "File exceeds the maximum allowed size of 10 MB."
        });
      }

      return res.status(400).json({
        message: "File upload error.",
        error: err.code
      });
    }

    if (err) {
      return res.status(400).json({
        message: "Invalid file upload."
      });
    }

    next();
  });
},

  async (req, res) => {
    let savedPath = null;

    try {
      if (!req.file) {
        return res.status(400).json({
          message: "Please select a document to upload"
        });
      }

      try {
  await validateUpload(req.file);
} catch (validationError) {
  return res.status(400).json({
    message: "Invalid file. Please upload a valid PDF, JPG, PNG, or DOCX document."
  });
}

   
const uploadDirectory = require("path").resolve(
  __dirname,
  "..",
  process.env.UPLOAD_DIR || "uploads"
);

await fsPromises.mkdir(uploadDirectory, {
  recursive: true
});

const filename = require("crypto").randomUUID() + ".upload";

savedPath = require("path").join(
  uploadDirectory,
  filename
);

await fsPromises.writeFile(savedPath, req.file.buffer, {
  flag: "wx"
});

const fileType = req.file.mimetype;

const [result] = await pool.query(
  `INSERT INTO uploads
   (order_id, file_name, file_path, file_type, file_size)
   VALUES (?, ?, ?, ?, ?)`,
  [
    Number(req.params.orderId),
    req.file.originalname,
    savedPath,
    fileType,
    req.file.size
  ]
);

return res.status(201).json({
  message: "Document uploaded successfully",
  upload_id: result.insertId,
  order_id: Number(req.params.orderId),
  file_name: req.file.originalname,
  file_type: fileType,
  file_size: req.file.size
});

    } catch (error) {
      if (savedPath) {
        try {
          await fsPromises.unlink(savedPath);
        } catch (cleanupError) {
          if (cleanupError.code !== "ENOENT") {
            console.error("Upload cleanup error:", cleanupError);
          }
        }
      }

      console.error("Document upload error:", error);

      return res.status(500).json({
        message: "Unable to upload document"
      });
    }
  }
);


app.get(
  "/api/orders/:orderId/uploads",
  authenticateToken,
  async (req, res) => {
    try {
      const orderId = Number(req.params.orderId);
      const customerId = req.customer.customer_id;

      // Validate order ID
      if (!Number.isSafeInteger(orderId) || orderId <= 0) {
        return res.status(400).json({
          message: "Invalid order ID"
        });
      }

      // Confirm that the customer owns the order
      const [orders] = await pool.query(
        `SELECT order_id
         FROM orders
         WHERE order_id = ? AND customer_id = ?`,
        [orderId, customerId]
      );

      if (orders.length === 0) {
        return res.status(404).json({
          message: "Order not found"
        });
      }

      // Retrieve uploaded document information
      const [documents] = await pool.query(
        `SELECT
           upload_id,
           order_id,
           file_name,
           file_type,
           file_size,
           uploaded_at
         FROM uploads
         WHERE order_id = ?
         ORDER BY uploaded_at DESC, upload_id DESC`,
        [orderId]
      );

      return res.status(200).json({
        message: "Documents retrieved successfully",
        order_id: orderId,
        total_documents: documents.length,
        documents
      });

    } catch (error) {
      console.error("Document retrieval error:", error);

      return res.status(500).json({
        message: "Unable to retrieve documents"
      });
    }
  }
);


app.get(
  "/api/orders/:orderId/uploads/:uploadId/download",
  authenticateToken,
  async (req, res) => {
    try {
      const orderId = Number(req.params.orderId);
      const uploadId = Number(req.params.uploadId);
      const customerId = req.customer.customer_id;

      // Validate IDs
      if (
        !Number.isSafeInteger(orderId) ||
        orderId <= 0 ||
        !Number.isSafeInteger(uploadId) ||
        uploadId <= 0
      ) {
        return res.status(400).json({
          message: "Invalid order or upload ID"
        });
      }

      // Confirm that the customer owns the order
      const [orders] = await pool.query(
        `SELECT order_id
         FROM orders
         WHERE order_id = ? AND customer_id = ?`,
        [orderId, customerId]
      );

      if (orders.length === 0) {
        return res.status(404).json({
          message: "Order not found"
        });
      }

      // Find the document associated with this order
      const [documents] = await pool.query(
        `SELECT upload_id, file_name, file_path
         FROM uploads
         WHERE upload_id = ? AND order_id = ?`,
        [uploadId, orderId]
      );

      if (documents.length === 0) {
        return res.status(404).json({
          message: "Document not found"
        });
      }

      const document = documents[0];
      const path = require("path");

      // Restrict downloads to the private uploads folder
      const uploadDirectory = require("path").resolve(
  __dirname,
  "..",
  process.env.UPLOAD_DIR || "uploads"
);
      const filePath = path.resolve(document.file_path);

      if (
        path.dirname(filePath) !== uploadDirectory ||
        !/^[0-9a-f-]{36}\.upload$/i.test(path.basename(filePath))
      ) {
        return res.status(403).json({
          message: "Invalid document storage location"
        });
      }

      // Confirm that the file exists
      try {
        await fsPromises.access(filePath);
      } catch {
        return res.status(404).json({
          message: "Document file not found"
        });
      }

      // Send the document as a download
      return res.download(
        filePath,
        document.file_name,
        (error) => {
          if (error) {
            console.error("Document download error:", error);

            if (!res.headersSent) {
              res.status(500).json({
                message: "Unable to download document"
              });
            }
          }
        }
      );

    } catch (error) {
      console.error("Download request error:", error);

      if (!res.headersSent) {
        return res.status(500).json({
          message: "Unable to download document"
        });
      }
    }
  }
);

if (require.main === module) {
  app.listen(PORT, "0.0.0.0", () => {
    console.log(`PrintHub API running on port ${PORT}`);
  });
}
module.exports = app;