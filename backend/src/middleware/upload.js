const multer = require('multer');
const path = require('path');
const sharp = require('sharp');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');

// Ensure upload directory exists
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// Configure multer for memory storage (we'll process and save manually)
const storage = multer.memoryStorage();

// File filter
const fileFilter = (req, file, cb) => {
  const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif'];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error('Invalid file type. Only JPEG, PNG, and GIF images are allowed.'), false);
  }
};

// Configure multer
const upload = multer({
  storage: storage,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024, // 5MB default
    files: 5 // Max 5 files per upload
  },
  fileFilter: fileFilter
});

// Process and save images
const processImages = async (req, res, next) => {
  if (!req.files || req.files.length === 0) {
    return next();
  }

  req.processedFiles = [];

  try {
    for (const file of req.files) {
      // Generate unique filename
      const filename = `${uuidv4()}.webp`;
      const filepath = path.join(uploadDir, filename);

      // Process image with sharp
      await sharp(file.buffer)
        .resize(1200, 900, { 
          fit: 'inside', 
          withoutEnlargement: true 
        })
        .webp({ quality: 80 })
        .toFile(filepath);

      // Store file info
      req.processedFiles.push({
        filename: filename,
        originalName: file.originalname,
        mimetype: 'image/webp',
        size: fs.statSync(filepath).size,
        url: `/api/uploads/${filename}`
      });
    }

    next();
  } catch (error) {
    // Clean up any files that were created
    if (req.processedFiles) {
      for (const file of req.processedFiles) {
        const filepath = path.join(uploadDir, file.filename);
        if (fs.existsSync(filepath)) {
          fs.unlinkSync(filepath);
        }
      }
    }

    return res.status(400).json({
      success: false,
      message: `Image processing failed: ${error.message}`
    });
  }
};

// Delete file utility
const deleteFile = (filename) => {
  const filepath = path.join(uploadDir, filename);
  if (fs.existsSync(filepath)) {
    fs.unlinkSync(filepath);
  }
};

module.exports = {
  upload: upload.array('photos', 5),
  processImages,
  deleteFile,
  uploadDir
};