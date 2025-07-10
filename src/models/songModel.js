const mongoose = require("mongoose");

const songSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Song title is required"],
  },
  duration: {
    type: String,
    required: [true, "Duration is required"],
  },
  cloudinaryUrl: {
    type: String,
    required: [true, "Cloudinary URL is required"],
  },
  artistId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Artist",
    required: [true, "Artist ID is required"],
  },
  albumId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Album",
    required: [true, "Album ID is required"],
  },
  genreId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Genre",
    required: [true, "Genre ID is required"],
  },
  uploadedBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, "Uploader ID is required"],
  }
}, {
  timestamps: true
});

module.exports = mongoose.model("Song", songSchema);
