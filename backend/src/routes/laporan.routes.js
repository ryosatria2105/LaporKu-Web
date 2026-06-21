import { Router }       from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import {
  upload,
  getLaporanById,
  getAllLaporan,
  getMyLaporan,
  createLaporan,
  updateLaporan,
  deleteLaporan,
  adminDeleteLaporan,
  restoreLaporan,
  getStats,
  getAllAdmin,
  updateStatus,
} from '../controllers/laporan.controller.js';

const router = Router();

// ⚠️  /stats dan /admin harus SEBELUM /:id
// supaya Express tidak salah parse "stats"/"admin" sebagai id param
router.get('/stats',        authenticate, getStats);
router.get('/admin',        authenticate, getAllAdmin);

// Publik — semua bisa lihat laporan (transparan)
router.get('/',             getAllLaporan);

// Butuh login
router.get('/my',           authenticate, getMyLaporan);
router.get('/:id',          getLaporanById);
router.post('/',            authenticate, upload.array('gambar', 5), createLaporan);
router.put('/:id',          authenticate, upload.array('gambar', 5), updateLaporan);
router.delete('/:id',              authenticate, deleteLaporan);
router.delete('/:id/admin',        authenticate, adminDeleteLaporan);
router.patch('/:id/restore',       authenticate, restoreLaporan);
router.patch('/:id/status',        authenticate, updateStatus);

export default router;