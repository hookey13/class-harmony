const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { v4: uuidv4 } = require('uuid');
const { APIError } = require('./errorHandler');

// Configure storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadDir = path.join(__dirname, '../uploads');
    const userDir = path.join(uploadDir, req.user._id.toString());
    const documentType = req.body.documentType || 'misc';
    const finalDir = path.join(userDir, documentType);

    // Create directories if they don't exist
    fs.mkdirSync(finalDir, { recursive: true });
    cb(null, finalDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename with original extension
    const uniqueFilename = `${uuidv4()}${path.extname(file.originalname)}`;
    cb(null, uniqueFilename);
  }
});

// File filter function
const fileFilter = (req, file, cb) => {
  // Define allowed file types based on document type
  const allowedTypes = {
    image: ['image/jpeg', 'image/png', 'image/gif'],
    document: ['application/pdf', 'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'],
    spreadsheet: ['application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'],
    misc: ['application/pdf', 'image/jpeg', 'image/png']
  };

  const documentType = req.body.documentType || 'misc';
  const allowed = allowedTypes[documentType] || allowedTypes.misc;

  if (allowed.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new APIError(`Invalid file type. Allowed types for ${documentType}: ${allowed.join(', ')}`, 400), false);
  }
};

// Create multer instance with configuration
const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
    files: 5 // Maximum 5 files per request
  }
});

// Middleware for handling single file uploads
const uploadSingle = (fieldName) => {
  return (req, res, next) => {
    upload.single(fieldName)(req, res, (err) => {
      if (err) {
        if (err instanceof multer.MulterError) {
          return next(new APIError(err.message, 400));
        }
        return next(err);
      }

      // Add file metadata to request
      if (req.file) {
        req.fileMetadata = {
          filename: req.file.filename,
          originalname: req.file.originalname,
          mimetype: req.file.mimetype,
          size: req.file.size,
          path: req.file.path,
          documentType: req.body.documentType || 'misc',
          uploadedBy: req.user._id,
          uploadedAt: new Date()
        };
      }

      next();
    });
  };
};

// Middleware for handling multiple file uploads
const uploadMultiple = (fieldName, maxCount = 5) => {
  return (req, res, next) => {
    upload.array(fieldName, maxCount)(req, res, (err) => {
      if (err) {
        if (err instanceof multer.MulterError) {
          return next(new APIError(err.message, 400));
        }
        return next(err);
      }

      // Add files metadata to request
      if (req.files) {
        req.filesMetadata = req.files.map(file => ({
          filename: file.filename,
          originalname: file.originalname,
          mimetype: file.mimetype,
          size: file.size,
          path: file.path,
          documentType: req.body.documentType || 'misc',
          uploadedBy: req.user._id,
          uploadedAt: new Date()
        }));
      }

      next();
    });
  };
};

// Middleware for handling file deletion
const deleteFile = async (filePath) => {
  try {
    await fs.promises.unlink(filePath);
    return true;
  } catch (error) {
    throw new APIError('Error deleting file', 500);
  }
};

// Middleware for validating file size
const validateFileSize = (maxSize = 5 * 1024 * 1024) => {
  return (req, res, next) => {
    if (req.file && req.file.size > maxSize) {
      deleteFile(req.file.path);
      return next(new APIError(`File too large. Maximum size is ${maxSize / 1024 / 1024}MB`, 400));
    }
    if (req.files) {
      const oversizedFiles = req.files.filter(file => file.size > maxSize);
      if (oversizedFiles.length > 0) {
        // Delete all uploaded files
        Promise.all(req.files.map(file => deleteFile(file.path)));
        return next(new APIError(`Some files are too large. Maximum size is ${maxSize / 1024 / 1024}MB`, 400));
      }
    }
    next();
  };
};

// Middleware for scanning files for viruses (placeholder)
const scanFile = () => {
  return (req, res, next) => {
    // TODO: Implement virus scanning
    // This would typically involve integrating with a virus scanning service
    next();
  };
};

// Middleware for optimizing images
const optimizeImage = () => {
  return async (req, res, next) => {
    if (!req.file || !req.file.mimetype.startsWith('image/')) {
      return next();
    }

    try {
      const sharp = require('sharp');
      const optimizedBuffer = await sharp(req.file.path)
        .resize(1920, 1080, { fit: 'inside', withoutEnlargement: true })
        .jpeg({ quality: 80 })
        .toBuffer();

      await fs.promises.writeFile(req.file.path, optimizedBuffer);
      
      // Update file size in metadata
      const stats = await fs.promises.stat(req.file.path);
      req.file.size = stats.size;
      if (req.fileMetadata) {
        req.fileMetadata.size = stats.size;
      }

      next();
    } catch (error) {
      next(new APIError('Error optimizing image', 500));
    }
  };
};

module.exports = {
  uploadSingle,
  uploadMultiple,
  validateFileSize,
  scanFile,
  optimizeImage,
  deleteFile
}; 