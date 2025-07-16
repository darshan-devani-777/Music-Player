const { body, check } = require("express-validator");

// CREATE GENRE
exports.createGenreValidator = [
  body("name")
    .notEmpty()
    .withMessage("Genre name is required")
    .isString()
    .withMessage("Genre name must be a string"),

  body("description")
    .notEmpty()
    .withMessage("Description is required")
    .isString()
    .withMessage("Description must be a string"),

  check("genreImage")
    .custom((value, { req }) => {
      if (!req.files || req.files.length === 0) {
        throw new Error("At least one genre image is required");
      }
      return true;
    }),
];

// UPDATE GENRE
exports.updateGenreValidator = [
  body("name")
    .optional({ checkFalsy: false })
    .notEmpty()
    .withMessage("Genre name is required")
    .isString()
    .withMessage("Genre name must be a string"),

  body("description")
    .optional({ checkFalsy: false })
    .notEmpty()
    .withMessage("Description is required")
    .isString()
    .withMessage("Description must be a string"),

  check("genreImage").custom((_, { req }) => {
    const body = req.body || {};

    if (body && "genreImage" in body && (!req.files || req.files.length === 0)) {
      throw new Error("Genre image is required");
    }

    if (req.files && !Array.isArray(req.files)) {
      throw new Error("Uploaded genre images must be in array format");
    }

    return true;
  }),

  check("any").custom((_, { req }) => {
    const body = req.body || {};

    const hasName = "name" in body;
    const hasDesc = "description" in body;
    const hasImage = req.files && req.files.length > 0;

    if (!hasName && !hasDesc && !hasImage) {
      throw new Error("At least one field (name, description, or genreImage) is required to update genre");
    }

    return true;
  }),
];