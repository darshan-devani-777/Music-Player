const express = require("express");
const router = express.Router();
const controller = require("../controllers/songController");
const authMiddleware = require("../middlewares/authMiddleware");
const { isAdmin } = require("../middlewares/roleMiddleware");
const { validationResult } = require("express-validator");
const {
    validateCreateSong,
    validateUpdateSong,
  } = require("../validatioN/songValidator");

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

// CREATE SONG (Admin)
router.post("/song/create-song", authMiddleware , isAdmin , validateCreateSong , validate , controller.createSong);

// GET ALL SONG (Admin / User)
router.get("/song/get-all-song", authMiddleware , controller.getAllSongs);

// GET SPECIFIC SONG (Admin)
router.get("/song/get-specific-song/:id", authMiddleware , isAdmin , controller.getSongById);

// UPDATE SONG (Admin)
router.put("/song/update-song/:id", authMiddleware , isAdmin , validateUpdateSong , validate , controller.updateSong);

// DELETE SONG (Admin)
router.delete("/song/delete-song/:id", authMiddleware , isAdmin , controller.deleteSong);

module.exports = router;
