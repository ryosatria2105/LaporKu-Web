import { Router } from 'express';
import { getAllPengguna, toggleActiveUser } from '../controllers/pengguna.controller.js';
import { authenticate } from '../middleware/auth.middleware.js';
import { requireAdmin } from '../middleware/auth.middleware.js';
const router = Router();

router.get('/',          authenticate, requireAdmin, getAllPengguna);
router.patch('/:id/toggle-active', authenticate, requireAdmin, toggleActiveUser);

export default router;