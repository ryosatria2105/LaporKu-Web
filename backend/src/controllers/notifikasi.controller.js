import { prisma } from '../lib/prisma.js';

// GET /api/v1/notifikasi — ambil notifikasi milik user yang login
export async function getNotifikasi(req, res) {
  try {
    const data = await prisma.notifikasi.findMany({
      where:   { userId: req.user.id },
      orderBy: { createdAt: 'desc' },
      take: 30,
    });
    const unread = data.filter(n => !n.dibaca).length;
    return res.json({ success: true, data, unread });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

// PATCH /api/v1/notifikasi/:id/baca — tandai 1 notifikasi sudah dibaca
export async function bacaNotifikasi(req, res) {
  try {
    const { id } = req.params;
    const notif = await prisma.notifikasi.findUnique({ where: { id: parseInt(id) } });
    if (!notif) return res.status(404).json({ success: false, message: 'Notifikasi tidak ditemukan.' });
    if (notif.userId !== req.user.id)
      return res.status(403).json({ success: false, message: 'Akses ditolak.' });
    await prisma.notifikasi.update({ where: { id: parseInt(id) }, data: { dibaca: true } });
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

// PATCH /api/v1/notifikasi/baca-semua — tandai semua sudah dibaca
export async function bacaSemuaNotifikasi(req, res) {
  try {
    await prisma.notifikasi.updateMany({
      where: { userId: req.user.id, dibaca: false },
      data:  { dibaca: true },
    });
    return res.json({ success: true });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}

// DELETE /api/v1/notifikasi/:id — hapus notifikasi milik admin (tidak memengaruhi notif masyarakat)
export async function hapusNotifikasi(req, res) {
  try {
    const { id } = req.params;
    const notif = await prisma.notifikasi.findUnique({ where: { id: parseInt(id) } });
    if (!notif) return res.status(404).json({ success: false, message: 'Notifikasi tidak ditemukan.' });
    if (notif.userId !== req.user.id)
      return res.status(403).json({ success: false, message: 'Akses ditolak.' });
    await prisma.notifikasi.delete({ where: { id: parseInt(id) } });
    return res.json({ success: true, message: 'Notifikasi berhasil dihapus.' });
  } catch (err) {
    return res.status(500).json({ success: false, message: err.message });
  }
}