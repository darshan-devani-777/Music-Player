const express = require('express');
const router = express.Router();
const authController = require('../controllers/userController');
const authMiddleware = require('../middlewares/authMiddleware');
const { isAdmin } = require('../middlewares/roleMiddleware');
const passport = require("passport");
const {
  signupValidation,
  loginValidation,
  forgotPasswordValidation,
  resetPasswordValidation
} = require("../validation/userValidator");
const { validationResult } = require("express-validator");

// VALIDATE
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: false,
      message: "Validation failed",
      errors: errors.array().map(e => e.msg),
    });
  }
  next();
};

// SIGNUP USER
router.post('/users/signup', signupValidation, validate, authController.signup);

// LOGIN USER
router.post('/users/login', loginValidation, validate, authController.login);

// GET ALL USER
router.get("/users/get-all-user", authMiddleware , isAdmin , authController.getAllUsers);

// DELETE USER
router.delete("/users/delete-user/:id", authMiddleware , isAdmin , authController.deleteUser);

// GOOGLE LOGIN
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// GOOGLE CALLBACK
router.get(
  '/google/callback',
  passport.authenticate('google', { session: false }),
  authController.googleSignup
);

// FORGOT PASSWORD (Admin)
router.post(
  '/admins/forgot-password',
  authMiddleware,
  isAdmin,
  forgotPasswordValidation,
  validate,
  authController.forgotPassword
);

// RESET PASSWORD (Admin)
router.post(
  '/admins/reset-password',
  authMiddleware,
  isAdmin,
  resetPasswordValidation,
  validate,
  authController.resetPassword
);

module.exports = router;
