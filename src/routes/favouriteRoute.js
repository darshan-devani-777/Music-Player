const express = require('express');
const router = express.Router();
const authMiddleware = require('../middlewares/authMiddleware');
const { isAdmin } = require('../middlewares/roleMiddleware');
const controller = require('../controllers/favouriteController');

// Add a song to favourites (User)
router.post('/favourite/add-to-favourite', authMiddleware , controller.addToFavourites);

// Remove a song from favourites (User)
router.delete('/favourite/remove-favourite', authMiddleware , controller.removeFavourite);

// Get all favourites of current user (User)
router.get('/favourite/get-all-favourite-current-user', authMiddleware , controller.getUserFavourites);

// Check if specific song is favourited (User)
router.get('/favourite/get-favourite-specific-song/:songId', authMiddleware , controller.getSpecificFavourite);

// Get all favourites (Admin)
router.get('/favourite/get-all-favourite', authMiddleware , isAdmin , controller.getAllFavourites);

// Get all favourites of a specific user (Admin)
router.get('/favourite/get-all-favourite-specific-user/:userId', authMiddleware, isAdmin , controller.getByUserId);

// Get all users who favourited a specific song (Admin)
router.get('/favourite/get-all-user-specific-favourite/song/:songId', authMiddleware , isAdmin , controller.getBySongId);

module.exports = router;
