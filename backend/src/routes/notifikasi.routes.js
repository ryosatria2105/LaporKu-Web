import { Router }       from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import { getNotifikasi, bacaNotifikasi, bacaSemuaNotifikasi, hapusNotifikasi } from '../controllers/notifikasi.controller.js';

const router = Router();

router.get('/',                    authenticate, getNotifikasi);
router.patch('/baca-semua',        authenticate, bacaSemuaNotifikasi);
router.patch('/:id/baca',          authenticate, bacaNotifikasi);
router.delete('/:id',              authenticate, hapusNotifikasi);

export default router;