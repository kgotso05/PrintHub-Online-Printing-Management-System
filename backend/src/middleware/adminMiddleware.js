
const pool = require("../config/db");

const requireAdmin = async (req, res, next) => {
  try {
    const customerId = req.customer?.customer_id;

    if (!customerId) {
      return res.status(401).json({
        status: "error",
        message: "Authentication required"
      });
    }

    const [users] = await pool.execute(
      "SELECT role FROM customers WHERE customer_id = ?",
      [customerId]
    );

    if (users.length === 0 || users[0].role !== "admin") {
      return res.status(403).json({
        status: "error",
        message: "Access denied. Administrators only."
      });
    }

    next();
  } catch (error) {
    console.error("Admin authorization error:", error.message);

    return res.status(500).json({
      status: "error",
      message: "Unable to verify administrator access"
    });
  }
};

module.exports = requireAdmin;
