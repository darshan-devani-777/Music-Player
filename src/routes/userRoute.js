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
  resetPasswordValidation,
  updateUserValidation
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

// SIGNUP USER (Public)
router.post(
  '/users/signup', 
  signupValidation, 
  validate, 
  authController.signup);

// LOGIN USER (Public)
router.post(
  '/users/login', 
  loginValidation, 
  validate, 
  authController.login);

// GET ALL USER (Admin)
router.get(
  "/users/get-all-user", 
  authMiddleware , 
  isAdmin , 
  authController.getAllUsers);

// UPDATE USER (Admin / User)
router.put(
  "/users/update-user/:userId/", 
  authMiddleware, 
  updateUserValidation , 
  validate , 
  authController.updateUser);

// DELETE USER (Admin)
router.delete(
  "/users/delete-user/:id", 
  authMiddleware , 
  isAdmin , 
  authController.deleteUser);

// GOOGLE LOGIN (Public)
router.get(
  '/google', 
  passport.authenticate('google', { scope: ['profile', 'email'] }));

// GOOGLE CALLBACK (Public)
router.get(
  '/google/callback',
  passport.authenticate('google', { session: false }),
  authController.googleSignup
);

// FORGOT PASSWORD (Public)
router.post(
  '/admins/forgot-password',
  forgotPasswordValidation,
  validate,
  authController.forgotPassword
);

// RESET PASSWORD (Public)
router.post(
  '/admins/reset-password',
  resetPasswordValidation,
  validate,
  authController.resetPassword
);

// GUEST TOKEN ROUTE (Public)
router.get(
  "/users/guest-access", 
  authController.generateGuestToken);

// GOOGLE LOGIN WITH TOKEN (Public)
router.post(
  "/verify-token", 
  authController.googleLoginWithToken);

module.exports = router;
