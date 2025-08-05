const { body } = require("express-validator");

// SIGNUP
exports.signupValidation = [
  body("name").notEmpty().withMessage("Name is required"),

  body("email")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Invalid email format"),

  body("password")
    .notEmpty()
    .withMessage("Password is required")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long")
    .matches(/[!@#$%^&*(),.?":{}|<>]/)
    .withMessage("Password must contain at least one special character")
    .matches(/^[A-Z]/)
    .withMessage("Password must start with a capital letter"),

  body("role")
    .notEmpty()
    .withMessage("Role is required")
    .isIn(["user", "admin"])
    .withMessage("Role must be either 'user' or 'admin'"),
];

// LOGIN
exports.loginValidation = [
  body("email")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Invalid email format"),

  body("password").notEmpty().withMessage("Password is required"),
];

// UPDATE USER
exports.updateUserValidation = [
  (req, res, next) => {
    const currentUser = req.user;
    const sentFields = Object.keys(req.body);
    const isSelf = currentUser._id.toString() === req.params.userId.toString();

    const passwordFields = ["oldPassword", "newPassword", "confirmPassword"];
    const hasPasswordFields = passwordFields.some((field) =>
      sentFields.includes(field)
    );

    if (currentUser.role === "admin") {
      if (isSelf) {
        const allowedFields = ["name", "email", "role", ...passwordFields];
        const invalidFields = sentFields.filter(
          (field) => !allowedFields.includes(field)
        );

        if (invalidFields.length > 0) {
          return res.status(400).json({
            status: false,
            message: `Admin can update only 'name', 'email', 'role', or password fields for themselves. Invalid field(s): ${invalidFields.join(", ")}`,
          });
        }
      } else {
        const allowedFields = ["role"];
        const invalidFields = sentFields.filter(
          (field) => !allowedFields.includes(field)
        );

        if (invalidFields.length > 0) {
          return res.status(400).json({
            status: false,
            message: `Admin can only update 'role' for other users. Invalid field(s): ${invalidFields.join(", ")}`,
          });
        }
      }
    }

    else {
      if (!isSelf) {
        return res.status(403).json({
          status: false,
          message: "You are not allowed to update other users",
        });
      }

      const allowedFields = ["name", "email", ...passwordFields];
      const invalidFields = sentFields.filter(
        (field) => !allowedFields.includes(field)
      );

      if (invalidFields.length > 0) {
        return res.status(400).json({
          status: false,
          message: `You can only update 'name', 'email', or password fields. Invalid field(s): ${invalidFields.join(", ")}`,
        });
      }
    }

    if (hasPasswordFields) {
      const missingFields = passwordFields.filter(
        (field) => !req.body[field]
      );

      if (missingFields.length > 0) {
        return res.status(400).json({
          status: false,
          message: `Missing password field(s): ${missingFields.join(", ")}`,
        });
      }
    }

    next();
  },

  body("name").optional().notEmpty().withMessage("Name cannot be empty"),

  body("email")
    .optional()
    .notEmpty()
    .withMessage("Email cannot be empty")
    .isEmail()
    .withMessage("Invalid email format"),

  body("role")
    .optional()
    .notEmpty()
    .withMessage("Role cannot be empty")
    .isIn(["user", "admin"])
    .withMessage("Role must be either 'user' or 'admin'"),

  body("oldPassword")
    .optional()
    .notEmpty()
    .withMessage("Old password cannot be empty"),

  body("newPassword")
    .optional()
    .notEmpty()
    .withMessage("New password cannot be empty")
    .isLength({ min: 6 })
    .withMessage("New password must be at least 6 characters long"),

  body("confirmPassword")
    .optional()
    .notEmpty()
    .withMessage("Confirm password cannot be empty")
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error("Confirm password must match new password");
      }
      return true;
    }),
];

// FORGOT PASSWORD
exports.forgotPasswordValidation = [
  body("email")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Invalid email format"),
];

// RESET PASSWORD
exports.resetPasswordValidation = [
  body("token").notEmpty().withMessage("Token is required"),

  body("newPassword")
    .notEmpty()
    .withMessage("New password is required")
    .isLength({ min: 6 })
    .withMessage("Password must be at least 6 characters long"),

  body("confirmPassword")
    .notEmpty()
    .withMessage("Confirm password is required")
    .custom((value, { req }) => {
      if (value !== req.body.newPassword) {
        throw new Error("Confirm password does not match new password");
      }
      return true;
    }),
];
