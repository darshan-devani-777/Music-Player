const Favourite = require('../models/favouriteModel');
const Song = require('../models/songModel');
const User = require('../models/userModel');

// ADD TO FAVOURITE
exports.addToFavourites = async (req, res) => {
  const { songId } = req.body;
  const userId = req.user._id;

  if (!songId || songId.trim() === '') {
    return res.status(400).json({
      success: false,
      message: 'Song ID is required to add to favourites'
    });
  }

  try {
    const songExists = await Song.findById(songId);
    if (!songExists) {
      return res.status(404).json({
        success: false,
        message: 'Song not found'
      });
    }

    const already = await Favourite.findOne({ user: userId, song: songId });
    if (already) {
      return res.status(400).json({
        success: false,
        message: 'Song already added to favourites'
      });
    }

    const fav = await Favourite.create({ user: userId, song: songId });

    const populatedFav = await Favourite.findById(fav._id)
      .populate('user', 'name email')
      .populate('song');

    res.status(201).json({
      success: true,
      message: 'Song added to favourites successfully...',
      data: populatedFav
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Server error while adding to favourites',
      error: err.message
    });
  }
};

// REMOVE FAVOURITE
exports.removeFavourite = async (req, res) => {
  const { songId } = req.body;

  if (!songId || songId.trim() === '') {
    return res.status(400).json({
      success: false,
      message: 'Song ID is required to remove to favourites'
    });
  }

  try {
    const removed = await Favourite.findOneAndDelete({
      user: req.user._id,
      song: songId
    })
    .populate('user', 'name email')
    .populate('song');

    if (!removed) {
      return res.status(404).json({
        success: false,
        message: 'Favourite not found or already removed'
      });
    }

    res.status(200).json({
      success: true,
      message: `Song '${removed.song.title}' removed from favourites successfully...`,
      removedFavouriteId: removed._id,
      user: removed.user,
      song: removed.song,
      removedAt: new Date()
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Server error while removing favourite',
      error: err.message
    });
  }
};

// GET ALL USER FAVOURITE
exports.getUserFavourites = async (req, res) => {
  try {
    const favourites = await Favourite.find({ user: req.user._id })
    .populate({
      path: 'user',
      select: 'name email'
    })
    .populate("song")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      message: 'Fetched user favourites successfully...',
      total: favourites.length,
      favourites
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Server error while fetching user favourites',
      error: err.message
    });
  }
};

// GET SPECIFIC SONG FAVOURITE
exports.getSpecificFavourite = async (req, res) => {
  const userId = req.user._id;
  const songId = req.params.songId;

  try {
    const favourite = await Favourite.findOne({ user: userId, song: songId })
    .populate('user', 'name email')
    .populate('song');

    if (!favourite) {
      return res.status(404).json({
        success: false,
        message: 'This song is not in your favourites'
      });
    }

    res.status(200).json({
      success: true,
      message: 'Favourite found successfully...',
      favouriteId: favourite._id,
      user: favourite.user,
      song: favourite.song,
      createdAt: favourite.createdAt
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Server error while checking specific favourite',
      error: err.message
    });
  }
};

// GET ALL FAVOURITE
exports.getAllFavourites = async (req, res) => {
  try {
    const favourites = await Favourite.find()
      .populate('user', 'name email')
      .populate('song');

    res.status(200).json({
      success: true,
      message: 'Fetched all favourites successfully...',
      total: favourites.length,
      favourites
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Server error while fetching all favourites',
      error: err.message
    });
  }
};

// GET FAVOURITE BY USER ID
exports.getByUserId = async (req, res) => {
  const { userId } = req.params;

  try {
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    const favourites = await Favourite.find({ user: userId })
      .populate('user', 'name email')
      .populate('song');

    res.status(200).json({
      success: true,
      message: `Fetched favourites for user: ${user.name}`,
      userId,
      total: favourites.length,
      favourites
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Server error while fetching favourites by user',
      error: err.message
    });
  }
};

// GET ALL USER BY SONG ID
exports.getBySongId = async (req, res) => {
  const { songId } = req.params;

  try {
    const song = await Song.findById(songId);
    if (!song) {
      return res.status(404).json({
        success: false,
        message: 'Song not found'
      });
    }

    const favourites = await Favourite.find({ song: songId })
      .populate('user', 'name email')
      .populate('song');

    res.status(200).json({
      success: true,
      message: `Fetched users who favourited: ${song.title}`,
      songId,
      total: favourites.length,
      users: favourites
    });

  } catch (err) {
    res.status(500).json({
      success: false,
      message: 'Server error while fetching favourites by song',
      error: err.message
    });
  }
};
