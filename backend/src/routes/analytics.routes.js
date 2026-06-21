import { Router } from 'express';
import { trackVisit, updateDuration, getVisitorStats, getVisitorTable, exportVisitorCsv } from '../controllers/analytics.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';

const router = Router();

// Public — dipanggil CookieBanner
router.post('/visit', trackVisit);
router.patch('/visit/:sessionId/duration', updateDuration);

// Export CSV — bisa diakses siapa saja (tanpa IP sensitif)
router.get('/visitors/csv', exportVisitorCsv);

// Tabel pengunjung — bisa diakses siapa saja (tanpa IP sensitif)
router.get('/visitors/table', getVisitorTable);

// Grafik + summary — khusus admin
router.get('/visitors', authenticate, getVisitorStats);

export default router;