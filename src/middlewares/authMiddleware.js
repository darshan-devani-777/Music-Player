const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

// authMiddleware
const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      status: false,
      message: "Unauthorized: Token not provided",
    });
  }

  const token = authHeader.split(" ")[1];

  const decodedUnverified = jwt.decode(token);

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // Guest Token Handling
    if (decoded.role === "guest") {
      req.user = { role: "guest", name: "Guest" };
      return next();
    }

    // Logged in User Handling
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({
        status: false,
        message: "Unauthorized: User not found",
      });
    }

    req.user = user;
    return next();
  } catch (err) {
    if (err.name === "TokenExpiredError") {
      if (decodedUnverified?.role === "guest") {
        return res.status(401).json({
          status: false,
          message: "3 days is over. Please generate guest token again.",
        });
      } else {
        return res.status(401).json({
          status: false,
          message: "Token expired. Please login again.",
        });
      }
    }

    return res.status(401).json({
      status: false,
      message: "Unauthorized: Invalid token",
    });
  }
};

module.exports = authMiddleware;
