const mongoose = require("mongoose");

const albumSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, "Album title is required"],
      trim: true,
    },
    releaseDate: {
      type: Date,
      required: [true, "Release date is required"],
    },
    albumImages: {
      type: [String],
      validate: {
        validator: function (arr) {
          return arr.length > 0;
        },
        message: "At least one album image is required",
      },
    },
    artistId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Artist",
      required: [true, "Artist ID is required"],
    },       
    songs: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Song", 
        required: [true, "Song ID is required"],
      },
    ],
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: [true, "CreatedBy is required"],
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Album", albumSchema);
