const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs');
const { verifyToken } = require('../middleware/authMiddleware');

// Ensure uploads directory exists
const createUploadDir = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`Created directory: ${dirPath}`);
  }
};

// Create upload directories
const uploadsDir = path.join(__dirname, '../uploads');
const chatAttachmentsDir = path.join(uploadsDir, 'chat-attachments');
createUploadDir(uploadsDir);
createUploadDir(chatAttachmentsDir);

// Configure storage for chat attachments
const chatAttachmentStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, chatAttachmentsDir);
  },
  filename: function (req, file, cb) {
    // Use user ID, timestamp, and original filename to ensure uniqueness
    const userId = req.user.id;
    const timestamp = Date.now();
    const fileExt = path.extname(file.originalname);
    const sanitizedFilename = path.basename(file.originalname, fileExt)
      .replace(/[^a-zA-Z0-9]/g, '_'); // Replace non-alphanumeric chars with underscore
    
    cb(null, `${userId}-${timestamp}-${sanitizedFilename}${fileExt}`);
  }
});

// File filter to allow common file types
const fileFilter = (req, file, cb) => {
  // Allow images, PDFs, and common document types
  const allowedTypes = [
    'image/jpeg', 'image/png', 'image/gif', 'image/webp',
    'application/pdf',
    'application/msword', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'text/plain'
  ];
  
  if (allowedTypes.includes(file.mimetype)) {
    cb(null, true);
  } else {
    cb(new Error(`File type ${file.mimetype} not allowed`), false);
  }
};

// Configure multer for chat attachments
const chatAttachmentUpload = multer({
  storage: chatAttachmentStorage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB max file size
    files: 5 // Max 5 files per upload
  },
  fileFilter: fileFilter
});

// Upload chat attachments
router.post('/chat-attachment', verifyToken, (req, res) => {
  chatAttachmentUpload.array('files')(req, res, function (err) {
    if (err) {
      console.error('Error uploading files:', err);
      return res.status(400).json({ 
        success: false, 
        message: err.message 
      });
    }
    
    // Process uploaded files
    const files = req.files.map(file => ({
      name: path.basename(file.originalname),
      type: file.mimetype,
      size: file.size,
      url: `/uploads/chat-attachments/${file.filename}`
    }));
    
    res.status(200).json({
      success: true,
      files: files
    });
  });
});

module.exports = router;
