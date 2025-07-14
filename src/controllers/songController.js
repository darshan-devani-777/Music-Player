const axios = require("axios");
const streamifier = require("streamifier");
const cloudinary = require("../utils/cloudinary");
const Song = require("../models/songModel");
const Album = require("../models/albumModel");
const Genre = require("../models/genreModel");

// CREATE SONG
exports.createSong = async (req, res) => {
  try {
    const { title, duration, artistId, albumId, genreId, fileUrl } = req.body;
    const userId = req.user.id;

    const existingSong = await Song.findOne({ title, artistId, albumId });
    if (existingSong) {
      return res.status(409).json({
        success: false,
        message: "This song already exists under the same album and artist.",
      });
    }

    // Download audio file from fileUrl
    const file = await axios.get(fileUrl, { responseType: "arraybuffer" });
    const buffer = Buffer.from(file.data, "binary");

    // Upload audio file to Cloudinary
    const audioUpload = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        {
          resource_type: "video",
          folder: "music-app/songs",
        },
        (err, result) => {
          if (err) {
            console.error("Cloudinary Audio Upload Error:", err);
            return reject(err);
          }
          resolve(result);
        }
      );
      streamifier.createReadStream(buffer).pipe(stream);
    });

    // Format duration if number
    let formattedDuration = duration;
    if (typeof duration === "number") {
      formattedDuration = formatDuration(duration);
    }

    let songImage = [];
    if (req.files && req.files.length > 0) {
      songImage = req.files.map((file) => file.path); 
    }

    // Create song
    const song = await Song.create({
      title,
      duration: formattedDuration,
      artistId,
      albumId,
      genreId,
      uploadedBy: userId,
      cloudinaryUrl: audioUpload.secure_url,
      songImage, 
    });

    // Add song to Album
    await Album.findByIdAndUpdate(albumId, { $push: { songs: song._id } });

    // Add song to Genre
    if (genreId) {
      await Genre.findByIdAndUpdate(genreId, { $push: { songs: song._id } });
    }

    const populatedSong = await Song.findById(song._id)
      .populate("uploadedBy", "name email")
      .populate("artistId")
      .populate("albumId")
      .populate("genreId");

    res.status(201).json({
      success: true,
      message: "Song Uploaded Successfully with images.",
      data: populatedSong,
    });
  } catch (err) {
    console.error("Song Upload Error:", err.message);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message,
    });
  }
};

// minutes:seconds format
function formatDuration(seconds) {
  if (isNaN(seconds)) return "0:00";
  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${remainingSeconds.toString().padStart(2, "0")}`;
}

// GET ALL SONG
exports.getAllSongs = async (req, res) => {
  try {
    const songs = await Song.find()
      .populate("artistId albumId genreId")
      .populate("uploadedBy", "_id name email");
    res
      .status(200)
      .json({
        success: true,
        message: "Songs Fetched Successfully...",
        data: songs,
      });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: "Server error", error: err.message });
  }
};

// GET NEWLY RELEASED SONG
exports.getNewReleasedSongs = async (req, res) => {
  try {
    const newSongs = await Song.find()
      .populate("artistId albumId genreId")
      .populate("uploadedBy", "_id name email")
      .sort({ createdAt: -1 }) 
      .limit(4); 

    res.status(200).json({
      success: true,
      message: "Newly Released Songs Retrieved Successfully...",
      data: newSongs,
    });
  } catch (err) {
    res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message,
    });
  }
};

// GET SPECIFIC SONG
exports.getSongById = async (req, res) => {
  try {
    const song = await Song.findById(req.params.id)
      .populate("artistId albumId genreId")
      .populate("uploadedBy", "_id name email");
    if (!song)
      return res
        .status(404)
        .json({ success: false, message: "Song not found" });

    res
      .status(200)
      .json({
        success: true,
        message: "Song Fetched Successfully...",
        data: song,
      });
  } catch (err) {
    res
      .status(500)
      .json({ success: false, message: "Server error", error: err.message });
  }
};

// UPDATE SONG
exports.updateSong = async (req, res) => {
  try {
    const song = await Song.findById(req.params.id);
    if (!song) {
      return res
        .status(404)
        .json({ success: false, message: "Song not found" });
    }

    // Permission check
    if (song.uploadedBy.toString() !== req.user.id) {
      return res.status(403).json({ success: false, message: "Unauthorized" });
    }

    const updates = {};
    let hasChanges = false;

    // Check for genreId update
    const oldGenreId = song.genreId?.toString();
    const newGenreId = req.body.genreId;

    if (newGenreId && newGenreId !== oldGenreId) {
      // Remove from old genre
      if (oldGenreId) {
        await Genre.findByIdAndUpdate(oldGenreId, {
          $pull: { songs: song._id },
        });
      }

      // Add to new genre
      await Genre.findByIdAndUpdate(newGenreId, {
        $addToSet: { songs: song._id },
      });

      updates.genreId = newGenreId;
      hasChanges = true;
    }

    // Check other fields
    const fieldsToCheck = ["title", "duration", "fileUrl", "artistId", "albumId"];

    fieldsToCheck.forEach((field) => {
      const oldValue = song[field]?.toString();
      const newValue = req.body[field];

      if (newValue && newValue !== oldValue) {
        updates[field] = newValue;
        hasChanges = true;
      }
    });

    // Handle new songImages if uploaded
    if (req.files && req.files.length > 0) {
      const newImageUrls = req.files.map((file) => file.path); 
      if (!song.songImage) {
        song.songImage = [];
      }
      song.songImage.push(...newImageUrls); 
      hasChanges = true;
    }

    if (!hasChanges) {
      return res.status(200).json({
        success: true,
        message: "No changes detected. Song already up to date.",
        data: song,
      });
    }

    // Apply updates
    Object.assign(song, updates);
    await song.save();

    const updatedSong = await Song.findById(song._id)
      .populate("artistId albumId genreId")
      .populate("uploadedBy", "_id name email");

    res.status(200).json({
      success: true,
      message: "Song Updated Successfully...",
      data: updatedSong,
    });
  } catch (err) {
    console.error("Song Update Error:", err);
    res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message,
    });
  }
};

// DELETE SONG
exports.deleteSong = async (req, res) => {
  try {
    const song = await Song.findById(req.params.id)
      .populate("artistId albumId genreId")
      .populate("uploadedBy", "_id name email");

    if (!song) {
      return res.status(404).json({
        success: false,
        message: "Song not found",
      });
    }

    if (song.uploadedBy._id.toString() !== req.user.id) {
      return res.status(403).json({
        success: false,
        message: "Unauthorized: You cannot delete this song",
      });
    }

    // Remove song reference
    if (song.genreId) {
      await Genre.findByIdAndUpdate(song.genreId, {
        $pull: { songs: song._id },
      });
    }

    const deletedSong = {
      id: song._id,
      title: song.title,
      artistId: song.artistId,
      albumId: song.albumId,
      genreId: song.genreId,
      cloudinaryUrl: song.cloudinaryUrl,
      uploadedBy: song.uploadedBy,
      createdAt: song.createdAt,
      deletedAt: new Date(),
    };

    await song.deleteOne();

    return res.status(200).json({
      success: true,
      message: "Song Deleted Successfully...",
      deletedSong: deletedSong,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Server error",
      error: err.message,
    });
  }
};
