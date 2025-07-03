const express = require("express");
const router = express.Router();
const upload = require("../middlewares/upload"); 
const artistController = require("../controllers/artistController");
const authMiddleware = require("../middlewares/authMiddleware"); 
const { isAdmin } = require('../middlewares/roleMiddleware');
const { validationResult } = require("express-validator");
const { createArtistValidation , updateArtistValidation } = require("../validation/artistValidator");

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

// CREATE ARTIST (Admin)
router.post(
  "/artist/create-artist",
  authMiddleware,
  isAdmin,
  upload.array("artistImage"),
  createArtistValidation,
  validate,
  artistController.createArtist
);

// GET ALL ARTIST (Admin / User)
router.get(
  "/artist/get-all-artist",
  authMiddleware,
  artistController.getAllArtists
);

// GET SPECIFIC ARTIST (Admin)
router.get(
  "/artist/get-specific-artist/:id",
  authMiddleware,
  isAdmin,
  artistController.getArtistById
);

// UPDATE ARTIST (Admin)
router.put(
  "/artist/update-artist/:id",
  authMiddleware,
  isAdmin,
  upload.array("artistImage"),
  updateArtistValidation,
  validate, 
  artistController.updateArtist
);

// DELETE ARTIST (Admin)
router.delete(
  "/artist/delete-artist/:id",
  authMiddleware,
  isAdmin,
  artistController.deleteArtist
);

module.exports = router;
