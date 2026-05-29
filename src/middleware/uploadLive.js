import multer from 'multer';
import path from 'path';
import fs from 'fs';

const UPLOAD_DIR = path.resolve('public/uploads');

// Ensure upload directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

// Storage engine configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, UPLOAD_DIR);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `livewall-${uniqueSuffix}${ext}`);
  }
});

// File filter validation (Videos and Images)
const fileFilter = (req, file, cb) => {
  const allowedImageTypes = /jpeg|jpg|png|webp/;
  const allowedVideoTypes = /mp4|mov|webm/;
  
  const ext = path.extname(file.originalname).toLowerCase().replace('.', '');
  const mimetype = file.mimetype;

  const isImage = allowedImageTypes.test(ext) || allowedImageTypes.test(mimetype);
  const isVideo = allowedVideoTypes.test(ext) || allowedVideoTypes.test(mimetype);

  if (isImage || isVideo) {
    return cb(null, true);
  }
  
  cb(new Error('Only JPEG, PNG, WEBP images and MP4, MOV, WEBM videos are allowed!'), false);
};

// Multer upload middleware configuration for live wallpapers
export const uploadLive = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 50 * 1024 * 1024 // 50MB maximum file size for videos
  }
});
