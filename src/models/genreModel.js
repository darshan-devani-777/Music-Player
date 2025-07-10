const mongoose = require("mongoose");

const genreSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Genre name is required"],
    trim: true,
    unique: true,
  },
  description: {
    type: String,
    required: [true, "Genre description is required"],
    trim: true,
  },
  genreImage: {
    type: [String],
    validate: {
      validator: function (arr) {
        return arr.length > 0;
      },
      message: "At least one genre image is required",
    },
  },
  songs: [ 
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Song",
    },
  ],
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: [true, "CreatedBy is required"],
  },
}, { timestamps: true });

module.exports = mongoose.model("Genre", genreSchema);
