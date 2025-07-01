const express = require("express");
const router = express.Router();
const upload = require("../middlewares/upload");
const albumController = require("../controllers/albumController");
const authMiddleware = require('../middlewares/authMiddleware');
const { isAdmin } = require('../middlewares/roleMiddleware');

// CREATE ALBUM (Admin)
router.post("/create/albums", upload.array("albumImages", 10) , authMiddleware , isAdmin , albumController.createAlbum
);

// GET ALL ALBUM (Admin / User)
router.get("/get-all-albums/albums", authMiddleware , albumController.getAllAlbums);

// GET SPECIFIC ALBUM (Admin)
router.get("/get-specific-album/albums/:id", authMiddleware , isAdmin , albumController.getAlbumById);

// UPDATE IMAGE (Admin)
router.put("/update-album/albums/:id", authMiddleware , isAdmin , upload.array("albumImages", 10), albumController.updateAlbum);

// DELETE ALBUM (Admin)
router.delete("/delete-album/albums/:id", authMiddleware , isAdmin , albumController.deleteAlbum);
  
module.exports = router;
