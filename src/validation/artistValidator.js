const { body } = require("express-validator");

// CREATE ARTIST
exports.createArtistValidation = [
  body("name").notEmpty().withMessage("Artist name is required"),
  body("bio").notEmpty().withMessage("Bio is required"),
  body("artistImage").custom((value, { req }) => {
    if (!req.files || req.files.length === 0) {
      throw new Error("At least one artist image is required");
    }
    return true;
  }),
];

// UPDATE ARTIST
exports.updateArtistValidation = [
  body("name")
    .optional()
    .notEmpty()
    .withMessage("Name is required if provided"),

  body("bio")
    .optional()
    .notEmpty()
    .withMessage("Bio is required if provided"),

    body("artistImage").custom((value, { req }) => {
      // Only require files if artistImage is not a string URL
      if (value && !value.startsWith("http")) {
        if (!req.files || req.files.length === 0) {
          throw new Error("At least one artist image is required.");
        }
      }
      return true;
    }),
    

  body().custom((_, { req }) => {
    const body = req.body || {};
    const hasName = Object.prototype.hasOwnProperty.call(body, "name");
    const hasBio = Object.prototype.hasOwnProperty.call(body, "bio");
    const hasImage = req.files && req.files.length > 0;

    if (!hasName && !hasBio && !hasImage) {
      throw new Error("At least one field (name, bio, or image) must be provided.");
    }

    return true;
  }),
];
