const { body } = require("express-validator");

// SIGNUP
exports.signupValidation = [
  body("name").notEmpty().withMessage("Name is required"),

  body("email")
    .notEmpty().withMessage("Email is required")
    .isEmail().withMessage("Invalid email format"),

  body("password")
    .notEmpty().withMessage("Password is required")
    .isLength({ min: 6 }).withMessage("Password must be at least 6 characters long"),

  body("role")
    .notEmpty().withMessage("Role is required")
    .isIn(["user", "admin"]).withMessage("Role must be either 'user' or 'admin'"),
];

// LOGIN
exports.loginValidation = [
  body("email")
    .notEmpty().withMessage("Email is required")
    .isEmail().withMessage("Invalid email format"),

  body("password")
    .notEmpty().withMessage("Password is required")
];

// UPDATE USER
exports.updateUserValidation = [
  (req, res, next) => {
    const currentUser = req.user; 
    const sentFields = Object.keys(req.body);

    if (currentUser.role === "admin") {
      const allowedFields = ["role"];
      const invalidFields = sentFields.filter(
        (field) => !allowedFields.includes(field)
      );

      if (invalidFields.length > 0) {
        return res.status(400).json({
          status: false,
          message: `Admin can only update 'role'. Invalid field(s): ${invalidFields.join(", ")}`,
        });
      }
    } else {
      // normal user
      if (currentUser._id.toString() !== req.params.userId.toString()) {
        return res.status(403).json({
          status: false,
          message: "You are not allowed to update other users",
        });
      }      

      const allowedFields = ["name", "email"];
      const invalidFields = sentFields.filter(
        (field) => !allowedFields.includes(field)
      );

      if (invalidFields.length > 0) {
        return res.status(400).json({
          status: false,
          message: `You can only update 'name' or 'email'. Invalid field(s): ${invalidFields.join(", ")}`,
        });
      }
    }

    next();
  },

  body("name")
    .optional()
    .notEmpty().withMessage("Name cannot be empty"),

  body("email")
    .optional()
    .notEmpty().withMessage("Email cannot be empty")
    .isEmail().withMessage("Invalid email format"),

  body("role")
    .optional()
    .notEmpty().withMessage("Role cannot be empty")
    .isIn(["user", "admin"]).withMessage("Role must be either 'user' or 'admin'")
];

// FORGOT PASSWORD
exports.forgotPasswordValidation = [
  body("email")
    .notEmpty().withMessage("Email is required")
    .isEmail().withMessage("Invalid email format"),
];

// RESET PASSWORD 
exports.resetPasswordValidation = [
  body("token")
    .notEmpty().withMessage("Token is required"),

  body("newPassword")
    .notEmpty().withMessage("New password is required")
    .isLength({ min: 6 }).withMessage("Password must be at least 6 characters long"),

  body("confirmPassword")
    .notEmpty().withMessage("Confirm password is required")
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error("Confirm password does not match new password");
      }
      return true;
    }),
];