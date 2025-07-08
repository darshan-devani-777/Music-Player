const jwt = require("jsonwebtoken");
const User = require("../models/userModel");

const authMiddleware = async (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({
      status: false,
      message: "Unauthorized: Token not provided",
    });
  }

  const token = authHeader.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // If guest token
    if (decoded.role === "guest") {
      req.user = { role: "guest", name: "Guest" };
      return next();
    }

    // For normal users
    const user = await User.findById(decoded.id);
    if (!user) {
      return res.status(401).json({
        status: false,
        message: "Unauthorized: User not found",
      });
    }

    req.user = user;
    next();

  } catch (err) {
    if (err.name === "TokenExpiredError") {
      return res.status(401).json({
        status: false,
        message: "10 minutes is over. Please generate guest token again.",
      });
    }

    return res.status(401).json({
      status: false,
      message: "Unauthorized: Invalid or expired token",
    });
  }
};

module.exports = authMiddleware;
