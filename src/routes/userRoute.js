const express = require('express');
const router = express.Router();
const authController = require('../controllers/userController');
const authMiddleware = require('../middlewares/authMiddleware');
const { isAdmin } = require('../middlewares/roleMiddleware');
const passport = require("passport");

// SIGNUP USER
router.post('/users/signup', authController.signup);

// LOGIN USER
router.post('/users/login', authController.login);

// GOOGLE LOGIN - Redirect to Google
router.get('/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

// GOOGLE CALLBACK
router.get(
  '/google/callback',
  passport.authenticate('google', { session: false }),
  authController.googleSignup
);

// FORGOT PASSWORD (Admin)
router.post('/admins/forgot-password', authMiddleware , isAdmin , authController.forgotPassword);

// RESET PASSWORD (Admin)
router.post('/admins/reset-password', authMiddleware , isAdmin , authController.resetPassword);

module.exports = router;
