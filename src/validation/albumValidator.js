const { body } = require("express-validator");

// CREATE ALBUM 
exports.createAlbumValidation = [
  body("title")
    .notEmpty()
    .withMessage("Album title is required"),

  body("artistId")
    .notEmpty()
    .withMessage("Artist ID is required")
    .isMongoId()
    .withMessage("Invalid Artist ID"),

  body("releaseDate")
    .notEmpty()
    .withMessage("Release date is required")
    .isISO8601({ strict: true })
    .withMessage("Release date must be in YYYY-MM-DD format"),

  body("albumImages").custom((_, { req }) => {
    if (!req.files || req.files.length === 0) {
      throw new Error("At least one album image is required");
    }
    return true;
  }),
];

// UPDATE ALBUM 
exports.updateAlbumValidation = [
  body("title")
    .optional()
    .notEmpty()
    .withMessage("Title cannot be empty"),

  body("artistId")
    .optional()
    .notEmpty()
    .withMessage("Artist ID cannot be empty")
    .isMongoId()
    .withMessage("Invalid Artist ID"),

  body("releaseDate")
    .optional()
    .notEmpty()
    .withMessage("Release date cannot be empty")
    .isISO8601()
    .withMessage("Release date must be in YYYY-MM-DD format"),

  body("albumImages").custom((_, { req }) => {
    if (req.files && req.files.length === 0 && "albumImages" in req.body) {
      throw new Error("At least one album image is required.");
    }
    return true;
  }),

  body().custom((_, { req }) => {
    const hasTitle = req.body?.title?.trim()?.length > 0;
    const hasArtistId = req.body?.artistId?.trim()?.length > 0;
    const hasReleaseDate = req.body?.releaseDate?.trim()?.length > 0;
    const hasImage = req.files && req.files.length > 0;

    if (!hasTitle && !hasArtistId && !hasReleaseDate && !hasImage) {
      throw new Error("At least one field (title, artistId, releaseDate, albumImages) must be provided.");
    }

    return true;
  }),
];
