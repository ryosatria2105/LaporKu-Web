import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/auth.middleware.js';import { getKategori, createKategori, updateKategori, deleteKategori } from '../controllers/kategori.controller.js';

const router = Router();

router.get('/', getKategori);                                          // publik
router.post('/', authenticate, requireRole('admin'), createKategori);
router.put('/:id', authenticate, requireRole('admin'), updateKategori);
router.delete('/:id', authenticate, requireRole('admin'), deleteKategori);

export default router;