const express = require("express");
const router = express.Router();
const upload = require("../middlewares/upload");
const albumController = require("../controllers/albumController");
const authMiddleware = require('../middlewares/authMiddleware');
const { isAdmin } = require('../middlewares/roleMiddleware');
const { validationResult } = require("express-validator");
const { createAlbumValidation, updateAlbumValidation } = require("../validation/albumValidator");

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

// CREATE ALBUM (Admin)
router.post(
  "/album/create-album",
  authMiddleware,
  isAdmin,
  upload.array("albumImage"),
  createAlbumValidation,
  validate,
  albumController.createAlbum
);

// GET ALL ALBUMS (Admin / User)
router.get(
  "/album/get-all-album",
  authMiddleware,
  albumController.getAllAlbums
);

// GET NEW RELEASED ALBUMS (Admin / User)
router.get(
  "/album/new-released-album",
  authMiddleware,
  albumController.getNewReleasedAlbums
);

// GET SPECIFIC ALBUM (Admin / User)
router.get(
  "/album/get-specific-album/:id",
  authMiddleware,
  albumController.getAlbumById
);

// UPDATE ALBUM (Admin)
router.put(
  "/album/update-album/:id",
  authMiddleware,
  isAdmin,
  upload.array("albumImage"), 
  updateAlbumValidation,
  validate,
  albumController.updateAlbum
);

// DELETE ALBUM (Admin)
router.delete(
  "/album/delete-album/:id",
  authMiddleware,
  isAdmin,
  albumController.deleteAlbum
);

module.exports = router;
