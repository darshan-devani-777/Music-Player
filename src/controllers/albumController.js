const Album = require("../models/albumModel");

// CREATE ALBUM
exports.createAlbum = async (req, res) => {
  try {
    const { title, artist, releaseDate } = req.body;
    const userId = req.user._id;

    const parsedDate = new Date(releaseDate);
    if (isNaN(parsedDate)) {
      return res.status(400).json({
        status: "error",
        message: "Invalid release date format.",
      });
    }

    const imageFilenames = req.files.map(file => file.filename);

    const album = new Album({
      title,
      artist,
      releaseDate: parsedDate,
      albumImages: imageFilenames,
      createdBy: userId,
    });

    const savedAlbum = await album.save();
    const populatedAlbum = await savedAlbum.populate("createdBy", "_id name email");

    res.status(201).json({
      status: "success",
      message: "Album Created Successfully...",
      data: populatedAlbum,
    });
  } catch (err) {
    console.error("Error creating album:", err.message);

    if (err.name === "ValidationError") {
      const messages = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({
        status: "error",
        message: "Validation failed",
        errors: messages,
      });
    }

    res.status(500).json({
      status: "error",
      message: "Failed to save album",
    });
  }
};

// GET ALL ALBUM
exports.getAllAlbums = async (req, res) => {
  try {
    const albums = await Album.find().populate("createdBy", "_id name email");

    res.status(200).json({
      status: "success",
      message: "All Albums Retrieved Successfully...",
      data: albums,
    });
  } catch (err) {
    console.error("Error fetching albums:", err.message);
    res.status(500).json({ status: "error", message: "Failed to fetch albums" });
  }
};

// GET SPECIFIC ALBUM
exports.getAlbumById = async (req, res) => {
  try {
    const album = await Album.findById(req.params.id).populate("createdBy", "_id name email");

    if (!album) {
      return res.status(404).json({
        status: "error",
        message: "Album not found",
      });
    }

    res.status(200).json({
      status: "success",
      message: "Album Retrieved Successfully...",
      data: album,
    });
  } catch (err) {
    console.error("Error fetching album:", err.message);
    res.status(500).json({ status: "error", message: "Failed to fetch album" });
  }
};

// UPDATE ALBUM
exports.updateAlbum = async (req, res) => {
  try {
    const body = req.body || {};
    const { title, artist, releaseDate } = body;

    const isTitlePresent = "title" in body;
    const isArtistPresent = "artist" in body;
    const isReleaseDatePresent = "releaseDate" in body;
    const hasFiles = req.files && req.files.length > 0;

    if (!isTitlePresent && !isArtistPresent && !isReleaseDatePresent && !hasFiles) {
      return res.status(400).json({
        status: "error",
        message: "At least one of title, artist, releaseDate, or images is required to update.",
      });
    }

    const updatedFields = {};

    if (isTitlePresent) updatedFields.title = title;
    if (isArtistPresent) updatedFields.artist = artist;

    if (isReleaseDatePresent) {
      const parsedDate = new Date(releaseDate);
      if (isNaN(parsedDate)) {
        return res.status(400).json({
          status: "error",
          message: "Invalid release date format.",
        });
      }
      updatedFields.releaseDate = parsedDate;
    }

    if (hasFiles) {
      updatedFields.albumImages = req.files.map(file => file.filename);
    }

    const updatedAlbum = await Album.findByIdAndUpdate(
      req.params.id,
      updatedFields,
      { new: true, runValidators: true }
    ).populate("createdBy", "_id name email");

    if (!updatedAlbum) {
      return res.status(404).json({
        status: "error",
        message: "Album not found",
      });
    }

    res.status(200).json({
      status: "success",
      message: "Album Updated Successfully...",
      data: updatedAlbum,
    });
  } catch (err) {
    console.error("Error updating album:", err.message);

    if (err.name === "ValidationError") {
      const messages = Object.values(err.errors).map(e => e.message);
      return res.status(400).json({
        status: "error",
        message: "Validation failed",
        errors: messages,
      });
    }

    res.status(500).json({
      status: "error",
      message: "Failed to update album",
    });
  }
};

// DELETE ALBUM
exports.deleteAlbum = async (req, res) => {
  try {
    const deletedAlbum = await Album.findByIdAndDelete(req.params.id);

    if (!deletedAlbum) {
      return res.status(404).json({
        status: "error",
        message: "Album not found",
      });
    }

    res.status(200).json({
      status: "success",
      message: "Album Deleted Successfully...",
      data: deletedAlbum,
    });
  } catch (err) {
    console.error("Error deleting album:", err.message);
    res.status(500).json({ status: "error", message: "Failed to delete album" });
  }
};






