import { Router } from 'express';
import authRoutes        from './auth.routes.js';
import analyticsRoutes   from './analytics.routes.js';
import profilRoutes      from './profil.routes.js';
import kategoriRoutes    from './kategori.routes.js';
import laporanRoutes     from './laporan.routes.js';
import penggunaRoutes    from './pengguna.routes.js';
import notifikasiRoutes  from './notifikasi.routes.js';

const router = Router();

router.use('/auth',        authRoutes);
router.use('/analytics',   analyticsRoutes);
router.use('/profil',      profilRoutes);
router.use('/kategori',    kategoriRoutes);
router.use('/laporan',     laporanRoutes);
router.use('/pengguna',    penggunaRoutes);
router.use('/notifikasi',  notifikasiRoutes);

export default router;