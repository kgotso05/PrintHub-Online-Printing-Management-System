
const jwt = require("jsonwebtoken");

function authenticateToken(req, res, next) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      status: "error",
      message: "Access denied. Authentication token required."
    });
  }

  const token = authHeader.slice(7);

  try {
    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is not configured");
    }

    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET,
      { algorithms: ["HS256"] }
    );

    if (!Number.isInteger(decoded.customer_id)) {
      return res.status(401).json({
        status: "error",
        message: "Invalid authentication token"
      });
    }

    req.customer = {
      customer_id: decoded.customer_id
    };

    next();

  } catch (error) {
    if (error.name === "TokenExpiredError") {
      return res.status(401).json({
        status: "error",
        message: "Token expired. Please log in again."
      });
    }

    if (error.name === "JsonWebTokenError" ||
        error.name === "NotBeforeError") {
      return res.status(401).json({
        status: "error",
        message: "Invalid authentication token"
      });
    }

    console.error("Authentication error:", error.message);

    return res.status(500).json({
      status: "error",
      message: "Authentication unavailable"
    });
  }
}

module.exports = authenticateToken;
