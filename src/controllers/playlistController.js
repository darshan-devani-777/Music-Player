const Playlist = require("../models/playlistModel");
const Album = require("../models/albumModel");
const Song = require("../models/songModel");

// CREATE PLAYLIST
exports.createPlaylist = async (req, res) => {
  try {
    const { title, description, albums, songs } = req.body;
    const userId = req.user._id;

    const imageUrls = req.files.map((file) => file.path);

    // Album IDs
    let albumIds = [];
    if (albums) {
      if (typeof albums === "string") {
        albumIds = albums.split(",").map((id) => id.trim());
      } else if (Array.isArray(albums)) {
        albumIds = albums;
      }
    }

    // Song IDs
    let songIds = [];
    if (songs) {
      if (typeof songs === "string") {
        songIds = songs.split(",").map((id) => id.trim());
      } else if (Array.isArray(songs)) {
        songIds = songs;
      }
    }

    const playlist = new Playlist({
      title,
      description,
      playlistImage: imageUrls,
      albums: albumIds,
      songs: songIds,
      createdBy: userId,
    });

    const savedPlaylist = await playlist.save();

    const populatedPlaylist = await Playlist.findById(savedPlaylist._id)
      .populate("createdBy", "_id name email")
      .populate("albums", "_id title artistId releaseDate albumImages")
      .populate("songs");

    res.status(201).json({
      status: "success",
      message: "Playlist Created Successfully...",
      data: populatedPlaylist,
    });
  } catch (err) {
    console.error("Error creating playlist:", err);
    res.status(500).json({
      status: "error",
      message: err.message || "Failed to create playlist",
    });
  }
};

// GET ALL PLAYLISTS
exports.getAllPlaylists = async (req, res) => {
  try {
    const playlists = await Playlist.find()
      .populate("createdBy", "_id name email")
      .populate("albums", "_id title artistId releaseDate albumImages")
      .populate("songs");

    res.status(200).json({
      status: "success",
      message: "All Playlists Fetched Successfully...",
      data: playlists,
    });
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: "Failed to fetch playlists",
    });
  }
};

// GET SPECIFIC PLAYLIST
exports.getPlaylistById = async (req, res) => {
  try {
    const playlist = await Playlist.findById(req.params.id)
      .populate("createdBy", "_id name email")
      .populate("albums", "_id title artistId releaseDate albumImages")
      .populate("songs");

    if (!playlist) {
      return res.status(404).json({
        status: "error",
        message: "Playlist not found",
      });
    }

    res.status(200).json({
      status: "success",
      message: "Playlist Fetched Successfully...",
      data: playlist,
    });
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: "Failed to fetch playlist",
    });
  }
};

// UPDATE PLAYLIST
exports.updatePlaylist = async (req, res) => {
  try {
    const { title, description, albums, songs } = req.body;
    const updatedFields = {};

    if (title) updatedFields.title = title;
    if (description) updatedFields.description = description;

    // Image update
    if (req.files && req.files.length > 0) {
      updatedFields.playlistImage = req.files.map((file) => file.path);
    }

    // Albums update
    if (albums) {
      let albumIds = [];
      if (typeof albums === "string") {
        albumIds = albums.split(",").map((id) => id.trim());
      } else if (Array.isArray(albums)) {
        albumIds = albums;
      }

      const validAlbums = await Album.find({ _id: { $in: albumIds } });
      if (validAlbums.length !== albumIds.length) {
        return res.status(400).json({
          status: "error",
          message: "One or more album IDs are invalid.",
        });
      }

      updatedFields.albums = albumIds;
    }

    // Songs update
    if (songs) {
      let songIds = [];
      if (typeof songs === "string") {
        songIds = songs.split(",").map((id) => id.trim());
      } else if (Array.isArray(songs)) {
        songIds = songs;
      }

      const validSongs = await Song.find({ _id: { $in: songIds } });
      if (validSongs.length !== songIds.length) {
        return res.status(400).json({
          status: "error",
          message: "One or more song IDs are invalid.",
        });
      }

      updatedFields.songs = songIds;
    }

    const updatedPlaylist = await Playlist.findByIdAndUpdate(
      req.params.id,
      updatedFields,
      { new: true }
    )
      .populate("createdBy", "_id name email")
      .populate("albums", "_id title artistId releaseDate albumImages")
      .populate("songs");

    if (!updatedPlaylist) {
      return res.status(404).json({
        status: "error",
        message: "Playlist not found",
      });
    }

    res.status(200).json({
      status: "success",
      message: "Playlist Updated Successfully...",
      data: updatedPlaylist,
    });
  } catch (err) {
    console.error("Error updating playlist:", err.message);
    res.status(500).json({
      status: "error",
      message: err.message || "Failed to update playlist",
    });
  }
};

// DELETE PLAYLIST
exports.deletePlaylist = async (req, res) => {
  try {
    const deleted = await Playlist.findByIdAndDelete(req.params.id)
      .populate("createdBy", "_id name email")
      .populate("albums", "_id title artistId releaseDate albumImages")
      .populate("songs");

    if (!deleted) {
      return res.status(404).json({
        status: "error",
        message: "Playlist not found",
      });
    }

    res.status(200).json({
      status: "success",
      message: "Playlist Deleted Successfully...",
      data: deleted,
    });
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: "Failed to delete playlist",
    });
  }
};
