
const multer = require("multer");
const path = require("path");
const crypto = require("crypto");
const fs = require("fs");

// Locate the uploads folder
const uploadDirectory = path.resolve(__dirname, "../../uploads");

// Create the folder if it does not exist
fs.mkdirSync(uploadDirectory, { recursive: true });

// Configure where uploaded files are stored
const storage = multer.memoryStorage();


// File types allowed by PrintHub
const allowedTypes = {
  ".pdf": "application/pdf",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".png": "image/png",
  ".docx": "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
};

// Configure file upload restrictions
const upload = multer({
  storage: storage,

  limits: {
    fileSize: 10 * 1024 * 1024,
    files: 1
  },

  fileFilter: (req, file, cb) => {
    const extension = path.extname(file.originalname).toLowerCase();

    if (allowedTypes[extension] !== file.mimetype) {
      return cb(new Error("Unsupported file type"));
    }

    cb(null, true);
  }
});

module.exports = upload;
