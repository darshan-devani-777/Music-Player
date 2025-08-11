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
  type: {
    type: String,
    enum: ["audio", "video"],
    required: [true, "Song type (audio or video) is required"],
  },
  songImage: {
    type: [String],
    validate: {
      validator: function (val) {
        return Array.isArray(val) && val.length > 0;
      },
      message: "At least one song image is required.",
    },
    required: [true, "Song images are required."],
    default: [],
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
