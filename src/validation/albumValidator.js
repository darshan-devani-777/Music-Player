const { body } = require("express-validator");

// CREATE ALBUM
exports.createAlbumValidation = [
  body("title").notEmpty().withMessage("Album title is required"),

  body("artist").notEmpty().withMessage("Artist name is required"),

  body("releaseDate")
    .notEmpty()
    .withMessage("Release date is required")
    .customSanitizer((value) => (value ? value.trim() : value))
    .isISO8601({ strict: true })
    .withMessage("Release date must be in YYYY-MM-DD format"),

  body("albumImages").custom((value, { req }) => {
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
      .withMessage("Title is required"),
  
    body("artist")
      .optional()
      .notEmpty()
      .withMessage("Artist is required"),
  
    body("releaseDate")
      .optional()
      .notEmpty()
      .withMessage("Release date is required")
      .isISO8601()
      .withMessage("Release date must be in YYYY-MM-DD format"),
  
    body("albumImages").custom((_, { req }) => {
      if (req.files && req.files.length === 0 && "albumImages" in req.body) {
        throw new Error("At least one album image is required.");
      }
      return true;
    }),
  
    body().custom((_, { req }) => {
      const hasTitle = req.body?.title;
      const hasArtist = req.body?.artist;
      const hasDate = req.body?.releaseDate;
      const hasImage = req.files && req.files.length > 0;
  
      if (!hasTitle && !hasArtist && !hasDate && !hasImage) {
        throw new Error("At least one field (title, artist, releaseDate, image) must be provided.");
      }
      return true;
    }),
  ];
