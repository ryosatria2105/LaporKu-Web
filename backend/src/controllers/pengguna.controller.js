import { prisma } from '../lib/prisma.js';

// GET /api/v1/pengguna — daftar semua user (admin only)
export const getAllPengguna = async (req, res, next) => {
  try {
    const users = await prisma.user.findMany({
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        nama: true,
        username: true,
        email: true,
        phone: true,
        role: true,
        fotoProfil: true,
        emailVerified: true,
        isActive: true,
        createdAt: true,
        _count: { select: { laporan: true } },
      },
    });
    res.json({ success: true, data: users });
  } catch (err) { next(err); }
};

// PATCH /api/v1/pengguna/:id/toggle-active — aktif/nonaktif user
export const toggleActiveUser = async (req, res, next) => {
  try {
    const id = parseInt(req.params.id);
    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) return res.status(404).json({ success: false, message: 'User tidak ditemukan' });

    const updated = await prisma.user.update({
      where: { id },
      data: { isActive: !user.isActive },
      select: { id: true, isActive: true },
    });
    res.json({ success: true, data: updated });
  } catch (err) { next(err); }
};