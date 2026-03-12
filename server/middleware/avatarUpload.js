const multer = require("multer");
const path = require("path");
const fs = require("fs");

const uploadsDir = path.join(__dirname, "..", "..", "public", "uploads", "avatars");
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

const storage = multer.diskStorage({

  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },

  filename: (req, file, cb) => {

    const uniqueName =
      "avatar_" + Date.now() + path.extname(file.originalname);

    cb(null, uniqueName);

  }

});

const upload = multer({ storage });

module.exports = upload;
