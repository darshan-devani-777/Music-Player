const mongoose = require("mongoose");

const playlistSchema = new mongoose.Schema({
  title: {
    type: String,
    required: [true, "Playlist title is required"],
  },
  description: String,
  playlistImage: {
    type: [String],
    validate: {
      validator: (arr) => arr.length > 0,
      message: "At least one playlist image is required",
    },
  },
  albums: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Album",
    }
  ],
  songs: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Song", 
    }
  ],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
}, { timestamps: true });

// Text index for search
playlistSchema.index({ title: "text", description: "text" });

module.exports = mongoose.model("Playlist", playlistSchema);
