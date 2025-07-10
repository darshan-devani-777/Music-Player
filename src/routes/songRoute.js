const express = require("express");
const router = express.Router();
const controller = require("../controllers/songController");
const authMiddleware = require("../middlewares/authMiddleware");
const { isAdmin } = require("../middlewares/roleMiddleware");

// CREATE SONG
router.post("/song/create-song", authMiddleware , isAdmin , controller.createSong);

// GET ALL SONG
router.get("/song/get-all-song", authMiddleware , controller.getAllSongs);

// GET SPECIFIC SONG
router.get("/song/get-specific-song/:id", authMiddleware , isAdmin , controller.getSongById);

// UPDATE SONG
router.put("/song/update-song/:id", authMiddleware , isAdmin , controller.updateSong);

// DELETE SONG
router.delete("/song/delete-song/:id", authMiddleware , isAdmin , controller.deleteSong);

module.exports = router;
