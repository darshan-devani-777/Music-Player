const Artist = require("../models/artistModel");
const Album = require("../models/albumModel");
const Playlist = require("../models/playlistModel");
const Song = require("../models/songModel");
const Genre = require("../models/genreModel");

// GLOBAL SEARCH
exports.globalSearch = async (req, res) => {
  try {
    const { query, page = 1, limit = 10 } = req.query;

    if (!query || query.trim() === "") {
      return res.status(400).json({
        status: false,
        message: "Search query is required.",
      });
    }

    const skip = (page - 1) * limit;

    const [artists, albums, playlists, songs, genres] = await Promise.all([
      Artist.find(
        { $text: { $search: query } },
        { score: { $meta: "textScore" } }
      )
        .sort({ score: { $meta: "textScore" } })
        .skip(skip)
        .limit(Number(limit)),

      Album.find(
        { $text: { $search: query } },
        { score: { $meta: "textScore" } }
      )
        .sort({ score: { $meta: "textScore" } })
        .skip(skip)
        .limit(Number(limit)),

      Playlist.find(
        { $text: { $search: query } },
        { score: { $meta: "textScore" } }
      )
        .sort({ score: { $meta: "textScore" } })
        .skip(skip)
        .limit(Number(limit)),

      Song.find(
        { $text: { $search: query } },
        { score: { $meta: "textScore" } }
      )
        .sort({ score: { $meta: "textScore" } })
        .skip(skip)
        .limit(Number(limit)),

      Genre.find(
        { $text: { $search: query } },
        { score: { $meta: "textScore" } }
      )
        .sort({ score: { $meta: "textScore" } })
        .skip(skip)
        .limit(Number(limit)),
    ]);

    return res.status(200).json({
      status: true,
      message: "Search Fetched Successfully...",
      query,
      page: Number(page),
      limit: Number(limit),
      results: {
        artists,
        albums,
        playlists,
        songs,
        genres,
      },
    });
  } catch (error) {
    return res.status(500).json({
      status: "error",
      message: "Internal Server Error",
      error: error.message,
    });
  }
};
