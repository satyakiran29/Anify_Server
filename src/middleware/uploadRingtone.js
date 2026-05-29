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
    cb(null, `ringtone-${uniqueSuffix}${ext}`);
  }
});

// File filter validation (Audio formats only)
const fileFilter = (req, file, cb) => {
  const allowedAudioTypes = /mp3|mpeg|ogg|wav/;
  
  const ext = path.extname(file.originalname).toLowerCase().replace('.', '');
  const mimetype = file.mimetype;

  const isAudio = allowedAudioTypes.test(ext) || allowedAudioTypes.test(mimetype);

  if (isAudio) {
    return cb(null, true);
  }
  
  cb(new Error('Only MP3, OGG, and WAV audio files are allowed!'), false);
};

// Multer upload middleware configuration for ringtones
export const uploadRingtone = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: 15 * 1024 * 1024 // 15MB maximum file size
  }
});
