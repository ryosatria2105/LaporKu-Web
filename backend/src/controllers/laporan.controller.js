// =============================================================
// DESIGN PATTERNS yang digunakan di file ini:
// 1. Repository Pattern → laporanRepository (akses data terpusat)
// 2. State Pattern      → canTransition (validasi transisi status)
// 3. Observer Pattern   → eventBus (notifikasi otomatis ke admin/user)
// 4. Factory Method     → ResponseFactory (standarisasi format response)
//    Referensi struktur: https://github.com/rednafi/flask-factory
//    Seperti create_app() Flask yang wrap semua blueprint,
//    ResponseFactory menjadi satu titik pembuat response API.
// Referensi: https://refactoring.guru/design-patterns
// =============================================================
import path     from 'path';
import fs       from 'fs';
import multer   from 'multer';
import { prisma } from '../lib/prisma.js';
import laporanRepository from '../repositories/laporan.repository.js';
import { canTransition, VALID_STATUSES } from '../utils/laporanStatus.js';
import { eventBus } from '../observers/NotifikasiObserver.js';
import ResponseFactory from '../factory/ResponseFactory.js';

// ── Helpers ─────────────────────────────────────────────────────
function parseGambar(gambar) {
  if (!gambar) return [];
  try {
    const parsed = JSON.parse(gambar);
    return Array.isArray(parsed) ? parsed : [gambar];
  } catch {
    return [gambar];
  }
}

function deleteFiles(filenames) {
  for (const f of filenames) {
    const fp = path.join(process.cwd(), 'uploads', path.basename(f));
    if (fs.existsSync(fp)) fs.unlinkSync(fp);
  }
}

// ── Multer config ───────────────────────────────────────────────
const storage = multer.diskStorage({
  destination(req, file, cb) {
    const dir = path.join(process.cwd(), 'uploads');
    if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
    cb(null, dir);
  },
  filename(req, file, cb) {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `laporan_${Date.now()}_${Math.random().toString(36).slice(2)}${ext}`);
  },
});

export const upload = multer({
  storage,
  fileFilter: (req, file, cb) => {
    const ok = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
    ok.includes(path.extname(file.originalname).toLowerCase())
      ? cb(null, true)
      : cb(new Error('Format tidak didukung. Gunakan JPG/PNG/WEBP.'));
  },
  limits: { fileSize: 5 * 1024 * 1024 },
});

// ── GET /api/v1/laporan — semua laporan (publik, transparan) ────
// ── GET /api/v1/laporan/:id — detail satu laporan ────────────
export async function getLaporanById(req, res) {
  try {
    const laporan = await laporanRepository.findById(req.params.id);
    if (!laporan) return ResponseFactory.error(res, 'Laporan tidak ditemukan', 404);
    return ResponseFactory.success(res, laporan);
  } catch (err) {
    return ResponseFactory.error(res, err.message);
  }
}

export async function getAllLaporan(req, res) {
  try {
    const { kategori, search } = req.query;

    const where = { deletedAt: null };
    if (kategori && kategori !== 'Semua') where.kategori = kategori;
    if (search) {
      where.OR = [
        { judul:      { contains: search, mode: 'insensitive' } },
        { keterangan: { contains: search, mode: 'insensitive' } },
        { nama:       { contains: search, mode: 'insensitive' } },
      ];
    }

    const data = await prisma.laporan.findMany({
      where,
      orderBy: { tanggal: 'desc' },
      include: {
        user: { select: { id: true, nama: true, fotoProfil: true } },
      },
    });

    return ResponseFactory.success(res, data);
  } catch (err) {
    return ResponseFactory.error(res, err.message, 500);
  }
}

// ── GET /api/v1/laporan/my — laporan milik sendiri ──────────────
export async function getMyLaporan(req, res) {
  try {
    const data = await prisma.laporan.findMany({
      where:   { userId: req.user.id, deletedAt: null },
      orderBy: { tanggal: 'desc' },
    });
    return ResponseFactory.success(res, data);
  } catch (err) {
    return ResponseFactory.error(res, err.message, 500);
  }
}

// ── POST /api/v1/laporan — buat laporan baru ────────────────────
export async function createLaporan(req, res) {
  const files = req.files || [];
  try {
    const { judul, kategori, keterangan, nama, nohp, lokasi } = req.body;

    if (!judul?.trim() || !kategori?.trim() || !keterangan?.trim() || !nama?.trim()) {
      deleteFiles(files.map(f => f.filename));
      return ResponseFactory.error(res, 'Field wajib tidak boleh kosong.', 400);
    }

    const id     = `RPT-${Date.now()}-${req.user.id}`;
    const gambar = files.length > 0 ? JSON.stringify(files.map(f => f.filename)) : null;

    const data = await prisma.laporan.create({
      data: {
        id,
        judul:      judul.trim(),
        kategori:   kategori.trim(),
        keterangan: keterangan.trim(),
        nama:       nama.trim(),
        nohp:       nohp?.trim()   || null,
        lokasi:     lokasi?.trim() || null,
        gambar,
        userId: req.user.id,
      },
    });

    // Observer Pattern: notifikasi ke admin via eventBus (fire & forget)
    eventBus.notify('laporan.dibuat', {
      laporanId: id,
      judul:     judul.trim(),
      nama:      nama.trim(),
      kategori:  kategori.trim(),
    }).catch(() => {});

    return ResponseFactory.success(res, data, 'Laporan berhasil dibuat.', 201);
  } catch (err) {
    deleteFiles(files.map(f => f.filename));
    return ResponseFactory.error(res, err.message, 500);
  }
}

// ── PUT /api/v1/laporan/:id — edit laporan milik sendiri ────────
export async function updateLaporan(req, res) {
  const files = req.files || [];
  try {
    const { id } = req.params;
    const existing = await prisma.laporan.findUnique({ where: { id } });

    if (!existing) {
      deleteFiles(files.map(f => f.filename));
      return ResponseFactory.error(res, 'Laporan tidak ditemukan.', 404);
    }
    if (existing.userId !== req.user.id) {
      deleteFiles(files.map(f => f.filename));
      return ResponseFactory.error(res, 'Akses ditolak. Kamu hanya bisa mengedit laporanmu sendiri.', 403);
    }
    if (existing.status !== 'menunggu') {
      deleteFiles(files.map(f => f.filename));
      return ResponseFactory.error(res, 'Laporan tidak dapat diedit karena sudah diproses.', 403);
    }

    const { judul, kategori, keterangan, nama, nohp, lokasi } = req.body;

    let gambar = existing.gambar;
    if (files.length > 0) {
      deleteFiles(parseGambar(existing.gambar));
      gambar = JSON.stringify(files.map(f => f.filename));
    }

    const data = await prisma.laporan.update({
      where: { id },
      data: {
        judul:      judul?.trim()      || existing.judul,
        kategori:   kategori?.trim()   || existing.kategori,
        keterangan: keterangan?.trim() || existing.keterangan,
        nama:       nama?.trim()       || existing.nama,
        nohp:       nohp?.trim()       || null,
        lokasi:     lokasi?.trim()     || null,
        gambar,
      },
    });

    return ResponseFactory.success(res, data, 'Laporan berhasil diperbarui.');
  } catch (err) {
    deleteFiles(files.map(f => f.filename));
    return ResponseFactory.error(res, err.message, 500);
  }
}

// ── DELETE /api/v1/laporan/:id — hapus laporan milik sendiri ────
export async function deleteLaporan(req, res) {
  try {
    const { id } = req.params;
    const row = await prisma.laporan.findUnique({ where: { id } });

    if (!row) return ResponseFactory.error(res, 'Laporan tidak ditemukan.', 404);
    if (row.userId !== req.user.id)
      return ResponseFactory.error(res, 'Akses ditolak. Kamu hanya bisa menghapus laporanmu sendiri.', 403);

    deleteFiles(parseGambar(row.gambar));
    await prisma.laporan.delete({ where: { id } });
    return ResponseFactory.success(res, null, 'Laporan berhasil dihapus.');
  } catch (err) {
    return ResponseFactory.error(res, err.message, 500);
  }
}

// ── DELETE /api/v1/laporan/:id/admin — admin soft delete ──────────
export async function adminDeleteLaporan(req, res) {
  try {
    if (req.user.role !== 'admin')
      return ResponseFactory.error(res, 'Akses ditolak.', 403);
    const { id } = req.params;
    const existing = await prisma.laporan.findUnique({ where: { id } });
    if (!existing)
      return ResponseFactory.error(res, 'Laporan tidak ditemukan.', 404);
    await prisma.laporan.update({ where: { id }, data: { deletedAt: new Date() } });
    return ResponseFactory.success(res, null, 'Laporan berhasil dihapus.');
  } catch (err) {
    return ResponseFactory.error(res, err.message, 500);
  }
}

// ── PATCH /api/v1/laporan/:id/restore — admin pulihkan laporan ──
export async function restoreLaporan(req, res) {
  try {
    if (req.user.role !== 'admin')
      return ResponseFactory.error(res, 'Akses ditolak.', 403);
    const { id } = req.params;
    const existing = await prisma.laporan.findUnique({ where: { id } });
    if (!existing)
      return ResponseFactory.error(res, 'Laporan tidak ditemukan.', 404);
    await prisma.laporan.update({ where: { id }, data: { deletedAt: null } });
    return ResponseFactory.success(res, null, 'Laporan berhasil dipulihkan.');
  } catch (err) {
    return ResponseFactory.error(res, err.message, 500);
  }
}

// ── GET /api/v1/laporan/stats ────────────────────────────────
export async function getStats(req, res) {
  try {
    const isAdmin = req.user.role === 'admin';
    const where   = isAdmin ? {} : { userId: req.user.id };
    const stats   = await laporanRepository.getStatsByStatus(where);

    let extra = {};
    if (isAdmin) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      const [totalUser, hariIni, aktivitas, topKategori] = await Promise.all([
        prisma.user.count({ where: { role: 'masyarakat' } }),
        laporanRepository.count({ createdAt: { gte: today } }),
        laporanRepository.getAktivitas7Hari(),
        laporanRepository.getTopKategori(5),
      ]);
      extra = { totalUser, hariIni, aktivitas, topKategori };
    }

    return ResponseFactory.success(res, { ...stats, ...extra });
  } catch (err) {
    return ResponseFactory.error(res, err.message, 500);
  }
}

// ── GET /api/v1/laporan/admin ────────────────────────────────
// Strategy Pattern: filter berubah dinamis via query params
export async function getAllAdmin(req, res) {
  try {
    if (req.user.role !== 'admin')
      return ResponseFactory.error(res, 'Akses ditolak.', 403);

    const { status, kategori, search } = req.query;

    const includeDeleted = req.query.include_deleted === 'true';
    const where = includeDeleted ? { deletedAt: { not: null } } : { deletedAt: null };
    if (status   && status   !== 'semua') where.status   = status;
    if (kategori && kategori !== 'Semua') where.kategori = kategori;
    if (search) {
      where.OR = [
        { judul:      { contains: search, mode: 'insensitive' } },
        { nama:       { contains: search, mode: 'insensitive' } },
        { keterangan: { contains: search, mode: 'insensitive' } },
      ];
    }

    const data = await laporanRepository.findAll(where);
    return ResponseFactory.success(res, data);
  } catch (err) {
    return ResponseFactory.error(res, err.message, 500);
  }
}

// ── PATCH /api/v1/laporan/:id/status ────────────────────────
// State Pattern: validasi transisi sebelum update
export async function updateStatus(req, res) {
  try {
    if (req.user.role !== 'admin')
      return ResponseFactory.error(res, 'Akses ditolak.', 403);

    const { id }     = req.params;
    const { status, alasanPenolakan } = req.body;

    if (!VALID_STATUSES.includes(status))
      return ResponseFactory.error(res, 'Status tidak valid.', 400);

    const existing = await laporanRepository.findById(id);
    if (!existing)
      return ResponseFactory.error(res, 'Laporan tidak ditemukan.', 404);

    if (!canTransition(existing.status, status))
      return ResponseFactory.error(res, `Tidak bisa ubah status dari "${existing.status}" ke "${status}".`, 400);

const data = await laporanRepository.updateStatus(id, status, alasanPenolakan || null);
    // Observer Pattern: notifikasi ke user pemilik laporan via eventBus
    await eventBus.notify('laporan.status_berubah', {
      laporanId:       id,
      userId:          existing.userId,
      judul:           existing.judul,
      statusBaru:      status,
      alasanPenolakan: alasanPenolakan || null,
    }).catch(() => {});

    return ResponseFactory.success(res, data, `Status diperbarui ke "${status}".`);
  } catch (err) {
    return ResponseFactory.error(res, err.message, 500);
  }
}