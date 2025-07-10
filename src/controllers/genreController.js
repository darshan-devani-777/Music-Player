const Genre = require("../models/genreModel");

// CREATE GENRE
exports.createGenre = async (req, res) => {
  try {
    const { name } = req.body;

    const existingGenre = await Genre.findOne({
      name: { $regex: new RegExp(`^${name}$`, "i") },
    });

    if (existingGenre) {
      return res.status(400).json({
        success: false,
        message: "Genre with this name already exists",
      });
    }

    const imageUrls = req.files?.map((file) => file.path) || [];

    const genre = new Genre({
      ...req.body,
      genreImage: imageUrls,
      createdBy: req.user._id,
    });

    await genre.save();

    const populatedGenre = await Genre.findById(genre._id).populate(
      "createdBy",
      "_id name email"
    );

    return res.status(201).json({
      success: true,
      message: "Genre Created Successfully...",
      data: populatedGenre,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: "Genre creation failed",
      error: error.message,
    });
  }
};

// GET ALL GENRE
exports.getAllGenres = async (req, res) => {
  try {
    const genres = await Genre.find()
      .sort({ createdAt: -1 })
      .populate("createdBy", "_id name email")
      .populate({
        path: "songs",
        populate: [
          { path: "artistId" },
          { path: "albumId" },
          { path: "uploadedBy", select: "name email" },
        ],
      });

    return res.status(200).json({
      success: true,
      message: "Genres with all songs fetched successfully....",
      data: genres,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Failed to fetch genres.",
      error: error.message,
    });
  }
};

// GET SPECIFIC GENRE
exports.getGenreById = async (req, res) => {
  try {
    const genre = await Genre.findById(req.params.id)
      .populate("createdBy", "_id name email")
      .populate({
        path: "songs",
        populate: [
          { path: "artistId" },
          { path: "albumId" },
          { path: "uploadedBy", select: "name email" },
        ],
      });

    if (!genre) {
      return res.status(404).json({
        success: false,
        message: `Genre not found with ID: ${req.params.id}`,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Genre Fetched Successfully...",
      data: genre,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error fetching genre",
      error: error.message,
    });
  }
};

// UPDATE GENRE
exports.updateGenre = async (req, res) => {
  try {
    const { id } = req.params;

    const existingGenre = await Genre.findById(id);
    if (!existingGenre) {
      return res.status(404).json({
        success: false,
        message: `No genre found with ID: ${id}`,
      });
    }

    const updatedFields = {
      ...req.body,
    };

    if (req.files && req.files.length > 0) {
      updatedFields.genreImage = req.files.map((file) => file.path);
    }

    const updatedGenre = await Genre.findByIdAndUpdate(id, updatedFields, {
      new: true,
      runValidators: true,
    })
      .populate("createdBy", "_id name email")
      .populate({
        path: "songs",
        populate: [
          { path: "artistId" },
          { path: "albumId" },
          { path: "uploadedBy", select: "name email" },
        ],
      });

    return res.status(200).json({
      success: true,
      message: "Genre Updated Successfully...",
      data: updatedGenre,
    });
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: "Failed to update genre",
      error: error.message,
    });
  }
};

// DELETE GENRE
exports.deleteGenre = async (req, res) => {
  try {
    const genre = await Genre.findByIdAndDelete(req.params.id).populate(
      "createdBy",
      "_id name email"
    );

    if (!genre) {
      return res.status(404).json({
        success: false,
        message: `Genre not found with ID: ${req.params.id}`,
      });
    }

    return res.status(200).json({
      success: true,
      message: "Genre Deleted Successfully...",
      deletedGenre: genre,
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: "Error deleting genre",
      error: error.message,
    });
  }
};
