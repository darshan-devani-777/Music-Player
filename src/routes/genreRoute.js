const express = require("express");
const router = express.Router();
const genreController = require("../controllers/genreController");
const authMiddleware = require("../middlewares/authMiddleware");
const { isAdmin } = require("../middlewares/roleMiddleware");
const upload = require("../middlewares/upload"); 
const { validationResult } = require("express-validator");
const {
  createGenreValidator,
  updateGenreValidator,
} = require("../validation/genreValidator");

// VALIDATE
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: false,
      message: "Validation failed",
      errors: errors.array().map(err => err.msg),
    });
  }
  next();
};

// CREATE GENRE (Admin)
router.post(
  "/genre/create-genre",
  authMiddleware,
  isAdmin,
  upload.array("genreImage"),  
  createGenreValidator,
  validate,
  genreController.createGenre
);

// GET ALL GENRE (Admin / User)
router.get(
  "/genre/get-all-genre", 
  authMiddleware, 
  genreController.getAllGenres
);

// GET SPECIFIC GENRE (Admin / User)
router.get(
  "/genre/get-specific-genre/:id", 
  authMiddleware, 
  genreController.getGenreById
);

// UPDATE GENRE (Admin)
router.put(
  "/genre/update-genre/:id",
  authMiddleware,
  isAdmin,
  upload.array("genreImage"),
  updateGenreValidator,
  validate,
  genreController.updateGenre
);

// DELETE GENRE (Admin)
router.delete(
  "/genre/delete-genre/:id", 
  authMiddleware, 
  isAdmin, 
  genreController.deleteGenre
);

module.exports = router;
