const Artist = require("../models/artistModel");
const Activity = require('../models/activityModel');

// CREATE ARTIST
exports.createArtist = async (req, res) => {
  try {
    const { name, bio } = req.body;
    const userId = req.user._id;

    const existingArtist = await Artist.findOne({
      name: { $regex: `^${name}$`, $options: "i" },
    });
    if (existingArtist) {
      return res.status(400).json({
        status: "error",
        message: "Artist with this name already exists.",
      });
    }

    const imageUrls = req.files.map((file) => file.path);

    const artist = new Artist({
      name,
      bio,
      artistImage: imageUrls,
      createdBy: userId,
    });

    const savedArtist = await artist.save();

    await Activity.create({
      user: userId,
      action: 'Created_artist',
      targetType: 'Artist',
      targetId: savedArtist._id,
    });

    const populatedArtist = await savedArtist.populate(
      "createdBy",
      "_id name email role"
    );

    res.status(201).json({
      status: "success",
      message: "Artist Created Successfully...",
      data: populatedArtist,
    });
  } catch (err) {
    console.error("Error creating artist:", err.message);
    res
      .status(500)
      .json({ status: "error", message: "Failed to create artist" });
  }
};

// GET ALL ARTISTS
exports.getAllArtists = async (req, res) => {
  try {
    const artists = await Artist.find().populate("createdBy", "name email");

    res.status(200).json({
      status: "success",
      message: "All Artists Fetched Successfully...",
      data: artists,
    });
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: "Failed to fetch artists",
    });
  }
};

// GET SPECIFIC ARTIST
exports.getArtistById = async (req, res) => {
  try {
    const artist = await Artist.findById(req.params.id).populate(
      "createdBy",
      "name email"
    );

    if (!artist) {
      return res.status(404).json({
        status: "error",
        message: "Artist not found",
      });
    }

    res.status(200).json({
      status: "success",
      message: "Artist Fetched Successfully...",
      data: artist,
    });
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: "Failed to fetch artist",
    });
  }
};

// UPDATE ARTIST
exports.updateArtist = async (req, res) => {
  try {
    const { name, bio } = req.body;

    const updatedFields = {};
    if (name !== undefined) updatedFields.name = name;
    if (bio !== undefined) updatedFields.bio = bio;
    if (req.files && req.files.length > 0) {
      updatedFields.artistImage = req.files.map((file) => file.path);
    }

    const updatedArtist = await Artist.findByIdAndUpdate(
      req.params.id,
      updatedFields,
      {
        new: true,
        runValidators: true,
        context: "query",
      }
    ).populate("createdBy", "_id name email");

    if (!updatedArtist) {
      return res.status(404).json({
        status: "error",
        message: "Artist not found",
      });
    }

    await Activity.create({
      user: userId,
      action: 'Updated_artist',
      targetType: 'Artist',
      targetId: updatedArtist._id,
    });

    return res.status(200).json({
      status: "success",
      message: "Artist Updated Successfully...",
      data: updatedArtist,
    });
  } catch (err) {
    console.error("Error updating artist:", err.message);

    if (err.name === "ValidationError") {
      const errorMessages = Object.values(err.errors).map((e) => e.message);
      return res.status(400).json({
        status: "error",
        message: errorMessages[0],
      });
    }

    return res.status(500).json({
      status: "error",
      message: "Failed to update artist",
    });
  }
};

// DELETE ARTIST
exports.deleteArtist = async (req, res) => {
  try {
    const deleted = await Artist.findByIdAndDelete(req.params.id).populate(
      "createdBy",
      "_id name email"
    );
    if (!deleted) {
      return res.status(404).json({
        status: "error",
        message: "Artist not found",
      });
    }

    await Activity.create({
      user: req.user._id,
      action: 'Deleted_artist',
      targetType: 'Artist',
      targetId: deleted._id,
    });
    
    res.status(200).json({
      status: "success",
      message: "Artist Deleted Successfully...",
      data: deleted,
    });
  } catch (err) {
    res.status(500).json({
      status: "error",
      message: "Failed to delete artist",
    });
  }
};
