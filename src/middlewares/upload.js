const multer = require("multer");
const { CloudinaryStorage } = require("multer-storage-cloudinary");
const cloudinary = require("../utils/cloudinary");

const storage = new CloudinaryStorage({
  cloudinary,
  params: async (req, file) => {
    let folder = "music-app";

    if (file.fieldname === "artistImage") folder = "music-app/artists";
    else if (file.fieldname === "albumImage") folder = "music-app/albums";
    else if (file.fieldname === "playlistImage") folder = "music-app/playlists";
    else if (file.fieldname === "genreImage") folder = "music-app/genres"; 
    else if (file.fieldname === "songImage") folder = "music-app/songs/images"; 

    return {
      folder,
      allowed_formats: ["jpg", "png", "jpeg"],
      public_id: file.originalname.split(".")[0],
    };
  },
});

const upload = multer({ storage });
module.exports = upload;
