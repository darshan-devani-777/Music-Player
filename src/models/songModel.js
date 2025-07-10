const mongoose = require("mongoose");

const songSchema = new mongoose.Schema({
  title: String,
  duration: String, 
  cloudinaryUrl: String,
  artistId: { type: mongoose.Schema.Types.ObjectId, ref: "Artist" },
  albumId: { type: mongoose.Schema.Types.ObjectId, ref: "Album" },
  genreId: { type: mongoose.Schema.Types.ObjectId, ref: "Genre" },
  uploadedBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
}, { timestamps: true });

module.exports = mongoose.model("Song", songSchema);
