const { body , param } = require("express-validator");

// COMMON FIELD
const songFields = [
  body("title")
    .notEmpty()
    .withMessage("Song title is required"),

  body("duration")
    .notEmpty()
    .withMessage("Duration is required"),

  body("fileUrl")
    .notEmpty()
    .withMessage("File URL is required"),

  body("artistId")
    .notEmpty()
    .withMessage("Artist ID is required"),

  body("albumId")
    .notEmpty()
    .withMessage("Album ID is required"),

  body("genreId")
    .notEmpty()
    .withMessage("Genre ID is required"),
];

// CREATE SONG 
exports.validateCreateSong = [...songFields];

// UPDATE SONG
exports.validateUpdateSong = [
  body("title").optional().notEmpty().withMessage("Title cannot be empty"),
  body("duration").optional().notEmpty().withMessage("Duration cannot be empty"),
  body("fileUrl").optional().notEmpty().withMessage("File URL cannot be empty"),
  body("songImage").optional().notEmpty().withMessage("Song Image cannot be empty"),
  body("artistId").optional().notEmpty().withMessage("Artist ID cannot be empty"),
  body("albumId").optional().notEmpty().withMessage("Album ID cannot be empty"),
  body("genreId").optional().notEmpty().withMessage("Genre ID cannot be empty"),
  body("uploadedBy").optional().notEmpty().withMessage("Uploader ID cannot be empty"),
];

// SONG ID
exports.validateSongId = [
  param("id")
    .isMongoId()
    .withMessage("Invalid song ID"),
];