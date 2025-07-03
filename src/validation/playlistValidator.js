const { body } = require("express-validator");

// CREATE PLAYLIST
exports.createPlaylistValidation = [
  body("title").notEmpty().withMessage("Playlist title is required"),

  body("description")
    .notEmpty()
    .withMessage("Description is required")
    .bail()
    .custom((value) => {
      if (typeof value !== "string") {
        throw new Error("Description must be a string");
      }
      if (/^\d+$/.test(value)) {
        throw new Error("Description cannot be numbers");
      }
      if (value.trim().length === 0) {
        throw new Error("Description must be a non-empty string");
      }
      return true;
    }),

  body("playlistImage").custom((_, { req }) => {
    if (!req.files || req.files.length === 0) {
      throw new Error("At least one playlist image is required");
    }
    return true;
  }),

  body("albums").custom((value, { req }) => {
    let albums = req.body?.albums;
    if (!albums) {
      throw new Error("Albums are required");
    }
    if (!Array.isArray(albums)) {
      albums = [albums];
    }
    if (albums.length === 0 || albums.some((id) => !id || id.trim() === "")) {
      throw new Error("Albums must be a non-empty array of album IDs");
    }
    return true;
  }),

  body().custom((_, { req }) => {
    const body = req.body || {};
    const hasTitle = "title" in (req.body || {});
    const hasDescription = "description" in (req.body || {});
    const hasAlbums = "albums" in (req.body || {});
    const hasImage = req.files && req.files.length > 0;

    if (!hasTitle && !hasDescription && !hasAlbums && !hasImage) {
      throw new Error(
        "At least one field (title, description, albums, or playlist image) is required"
      );
    }
    return true;
  }),
];

// UPDATE PLAYLIST
exports.updatePlaylistValidation = [
  body("title").optional().notEmpty().withMessage("Title is required."),

  body("description")
    .optional()
    .bail()
    .custom((value) => {
      if (typeof value !== "string") {
        throw new Error("Description is required.");
      }
      if (/^\d+$/.test(value)) {
        throw new Error("Description cannot be numbers");
      }
      if (value.trim().length === 0) {
        throw new Error("Description must be a non-empty string");
      }
      return true;
    }),

  body("playlistImage").custom((_, { req }) => {
    const isUpdatingImage =
      req.body?.playlistImage !== undefined ||
      (req.files && req.files.length > 0);

    if (isUpdatingImage && (!req.files || req.files.length === 0)) {
      throw new Error("At least one playlist image is required");
    }

    return true;
  }),

  body("albums").custom((_, { req }) => {
    let albums = req.body?.albums;

    if (albums === undefined) return true;

    if (!Array.isArray(albums)) {
      albums = [albums];
    }

    if (albums.length === 0 || albums.some((id) => !id || id.trim() === "")) {
      throw new Error("Albums is required.");
    }

    return true;
  }),

  body().custom((_, { req }) => {
    const body = req.body || {};
    const hasTitle = "title" in body;
    const hasDescription = "description" in body;
    const hasAlbums = "albums" in body;
    const hasImage = req.files && req.files.length > 0;

    if (!hasTitle && !hasDescription && !hasAlbums && !hasImage) {
      throw new Error(
        "At least one field (title, description, albums, or playlist image) is required"
      );
    }

    return true;
  }),
];
