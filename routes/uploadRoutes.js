const path = require('path');
const express = require('express');
const multer = require('multer');
const router = express.Router();

// 1. Configure where to save images
const storage = multer.diskStorage({
  destination(req, file, cb) {
    // Save directly to 'uploads/' folder in the project root
    cb(null, 'uploads/');
  },
  filename(req, file, cb) {
    // Rename file to avoid duplicates: fieldname-timestamp-random.jpg
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(
      null,
      `${file.fieldname}-${uniqueSuffix}${path.extname(file.originalname)}`
    );
  },
});

// 2. Filter to allow only Images
function checkFileType(file, cb) {
  const filetypes = /jpg|jpeg|png|webp|jfif/;
  const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = filetypes.test(file.mimetype);

  if (extname && mimetype) {
    return cb(null, true);
  } else {
    cb('Images only!');
  }
}

// 3. Initialize Multer
const upload = multer({
  storage,
  fileFilter: function (req, file, cb) {
    checkFileType(file, cb);
  },
});

// 4. The Route
router.post('/', upload.single('image'), (req, res) => {
  if (!req.file) {
    res.status(400);
    throw new Error('No file uploaded');
  }

  // IMPORTANT: Windows uses backslashes (\), but browsers need forward slashes (/)
  // We convert the path here so it works on the website.
  const imagePath = `/${req.file.path.replace(/\\/g, '/')}`;
  
  res.send(imagePath);
});

module.exports = router;