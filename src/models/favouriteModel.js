const mongoose = require('mongoose');

const favouriteSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'User ID is required']
  },
  song: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Song',
    required: [true, 'Song ID is required']
  }
}, {
  timestamps: true
});

favouriteSchema.index({ user: 1, song: 1 }, { unique: true });

module.exports = mongoose.model('Favourite', favouriteSchema);
