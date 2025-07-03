const mongoose = require("mongoose");

const artistSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, "Artist name is required"],
    trim: true,
  },
  bio: {
    type: String,
    required: [true, "bio is required"],
    trim: true,
  },
  artistImage: {
    type: [String],
    validate: {
      validator: function (arr) {
        return !this.isModified("artistImage") || arr.length > 0;
      },
      message: "At least one artist image is required",
    },
  },
  createdBy: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
  },
}, {
  timestamps: true,
  validateModifiedOnly: true,
});

module.exports = mongoose.model("Artist", artistSchema);
