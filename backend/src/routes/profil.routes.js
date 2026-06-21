import { Router } from 'express';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { authenticate } from '../middleware/auth.middleware.js';
import { getProfil, updateProfil, uploadFoto, deleteFoto, updatePassword } from '../controllers/profil.controller.js';

const router = Router();

// Setup multer untuk foto profil
const MIME_TO_EXT = {
  'image/jpeg': '.jpg',
  'image/jpg':  '.jpg',
  'image/png':  '.png',
  'image/webp': '.webp',
};

const storage = multer.diskStorage({
  destination(req, file, cb) {
    const dir = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename(req, file, cb) {
    // Fallback ext dari mimetype — penting untuk React Native yang tidak kirim extension
    let ext = path.extname(file.originalname).toLowerCase();
    if (!ext) ext = MIME_TO_EXT[file.mimetype] || '.jpg';
    cb(null, `profil_${req.user.id}_${Date.now()}${ext}`);
  }
});

const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    // Cek mimetype ATAU extension — React Native kadang tidak kirim extension
    const okMime = Object.keys(MIME_TO_EXT).includes(file.mimetype);
    const okExt  = ['.jpg', '.jpeg', '.png', '.webp'].includes(
      path.extname(file.originalname).toLowerCase()
    );
    okMime || okExt
      ? cb(null, true)
      : cb(new Error('Format tidak didukung. Gunakan JPG/PNG/WEBP.'));
  },
  limits: { fileSize: 5 * 1024 * 1024 } // 5MB
});

router.get('/', authenticate, getProfil);
router.patch('/', authenticate, updateProfil);
router.post('/foto', authenticate, upload.single('foto'), uploadFoto);
router.patch('/password', authenticate, updatePassword);
router.delete('/foto', authenticate, deleteFoto);

export default router;