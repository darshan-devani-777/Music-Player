const express = require("express");
const router = express.Router();
const upload = require("../middlewares/upload");
const playlistController = require("../controllers/playlistController");
const authMiddleware = require("../middlewares/authMiddleware");
const { isAdmin } = require("../middlewares/roleMiddleware");
const { validationResult } = require("express-validator");
const {
    createPlaylistValidation,
    updatePlaylistValidation
  } = require("../validation/playlistValidator");

// VALIDATE
const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      status: false,
      message: "Validation failed",
      errors: errors.array().map((err) => err.msg),
    });
  }
  next();
};

// CREATE PLAYLIST (Admin)
router.post(
  "/playlist/create-playlist",
  authMiddleware,
  isAdmin,
  upload.array("playlistImage"),
  createPlaylistValidation,
  validate,
  playlistController.createPlaylist
);

// GET ALL PLAYLIST (Admin / user)
router.get(
  "/playlist/get-all-playlist",
  authMiddleware,
  playlistController.getAllPlaylists
);

// GET SPECIFIC PLAYLIST (Admin)
router.get(
  "/playlist/get-specific-playlist/:id",
  authMiddleware,
  isAdmin,
  playlistController.getPlaylistById
);

// UPDATE PLAYLIST (Admin)
router.put(
  "/playlist/update-playlist/:id",
  authMiddleware,
  isAdmin,
  upload.array("playlistImage"),
  updatePlaylistValidation,
  validate,
  playlistController.updatePlaylist
);

// DELETE PLAYLIST (Admin)
router.delete(
  "/playlist/delete-playlist/:id",
  authMiddleware,
  isAdmin,
  playlistController.deletePlaylist
);

module.exports = router;
