// =============================================================
// REPOSITORY PATTERN  (Architectural — refactoring.guru)
// -------------------------------------------------------------
// Semua akses data laporan via Prisma disentralisasi di sini.
// Controller & service tidak sentuh prisma langsung — pakai repo.
// Keuntungan: mudah di-mock saat testing, ganti ORM cukup di sini.
// =============================================================
import { prisma } from '../lib/prisma.js';

const laporanRepository = {

  findAll: (where = {}, options = {}) =>
    prisma.laporan.findMany({
      where,
      orderBy: options.orderBy || { tanggal: 'desc' },
      take:    options.take,
      include: { user: { select: { id: true, nama: true, fotoProfil: true } } },
    }),

  findById: (id) =>
    prisma.laporan.findUnique({
      where: { id },
      include: { user: { select: { id: true, nama: true } } },
    }),

  count: (where = {}) =>
    prisma.laporan.count({ where }),

updateStatus: (id, status, catatanAdmin = null) =>
  prisma.laporan.update({
    where: { id },
    data:  { status, ...(catatanAdmin !== null && { catatanAdmin }) },
    include: { user: { select: { id: true, nama: true } } },
  }),

  getStatsByStatus: async (where = {}) => {
    const [total, menunggu, diproses, selesai, ditolak] = await Promise.all([
      prisma.laporan.count({ where }),
      prisma.laporan.count({ where: { ...where, status: 'menunggu' } }),
      prisma.laporan.count({ where: { ...where, status: 'diproses' } }),
      prisma.laporan.count({ where: { ...where, status: 'selesai'  } }),
      prisma.laporan.count({ where: { ...where, status: 'ditolak'  } }),
    ]);
    return { total, menunggu, diproses, selesai, ditolak };
  },

  // ── Poin 13: Single raw SQL menggantikan 7x sequential COUNT ──
  getAktivitas7Hari: async () => {
    const days = Array.from({ length: 7 }, (_, i) => {
      const d = new Date();
      d.setDate(d.getDate() - (6 - i));
      d.setHours(0, 0, 0, 0);
      return {
        label:   d.toLocaleDateString('id-ID', { weekday: 'short' }),
        tanggal: d.toISOString().split('T')[0],
      };
    });

    const sevenDaysAgo = new Date();
    sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 6);
    sevenDaysAgo.setHours(0, 0, 0, 0);

    const rows = await prisma.$queryRaw`
      SELECT
        DATE(created_at AT TIME ZONE 'Asia/Jakarta') AS tgl,
        COUNT(*)::int AS count
      FROM laporan
      WHERE created_at >= ${sevenDaysAgo}
      GROUP BY tgl
      ORDER BY tgl ASC
    `;

    const map = Object.fromEntries(
      rows.map(r => [r.tgl.toISOString().split('T')[0], r.count])
    );
    return days.map(d => ({ ...d, count: map[d.tanggal] ?? 0 }));
  },

  getTopKategori: (limit = 5) =>
    prisma.laporan.groupBy({
      by:      ['kategori'],
      _count:  { kategori: true },
      orderBy: { _count: { kategori: 'desc' } },
      take:    limit,
    }),

  // ─────────────────────────────────────────────────────────────
  // OPTIMAL QUERY A — CTE (Common Table Expression)
  // Menghitung jumlah laporan per kategori beserta persentasenya.
  // WITH clause dipakai untuk pre-compute total sebelum join,
  // sehingga tidak perlu subquery berulang per baris.
  // ─────────────────────────────────────────────────────────────
  getKategoriStats: async () => {
    const rows = await prisma.$queryRaw`
      WITH total_cte AS (
        SELECT COUNT(*)::int AS total FROM laporan
      ),
      kategori_cte AS (
        SELECT
          kategori,
          COUNT(*)::int AS jumlah
        FROM laporan
        GROUP BY kategori
      )
      SELECT
        k.kategori,
        k.jumlah,
        t.total,
        ROUND((k.jumlah::numeric / NULLIF(t.total, 0)) * 100, 2) AS persentase
      FROM kategori_cte k
      CROSS JOIN total_cte t
      ORDER BY k.jumlah DESC
    `;
    return rows;
  },

  // ─────────────────────────────────────────────────────────────
  // OPTIMAL QUERY B — Window Function (ROW_NUMBER + RANK)
  // Peringkat laporan per kategori berdasarkan tanggal terbaru.
  // ROW_NUMBER() OVER (PARTITION BY kategori ORDER BY tanggal DESC)
  // memberi nomor urut dalam setiap partisi kategori — efisien
  // karena PostgreSQL tidak perlu full scan ulang per kategori.
  // ─────────────────────────────────────────────────────────────
  getLaporanTerbaruPerKategori: async () => {
    const rows = await prisma.$queryRaw`
      SELECT
        id,
        judul,
        kategori,
        status,
        tanggal,
        ROW_NUMBER() OVER (PARTITION BY kategori ORDER BY tanggal DESC) AS urutan,
        RANK()       OVER (ORDER BY tanggal DESC)                        AS ranking_global
      FROM laporan
      WHERE status != 'ditolak'
      ORDER BY kategori, urutan
    `;
    return rows;
  },

  // ─────────────────────────────────────────────────────────────
  // OPTIMAL QUERY C — Subquery untuk filter laporan > rata-rata
  // Mengembalikan kategori yang jumlah laporannya di atas rata-rata
  // semua kategori. Subquery di WHERE clause menghitung rata-rata
  // secara efisien tanpa HAVING yang perlu scan dua kali.
  // ─────────────────────────────────────────────────────────────
  getKategoriDiatasRataRata: async () => {
    const rows = await prisma.$queryRaw`
      SELECT
        kategori,
        COUNT(*)::int AS jumlah
      FROM laporan
      GROUP BY kategori
      HAVING COUNT(*) > (
        SELECT AVG(cnt)
        FROM (
          SELECT COUNT(*) AS cnt
          FROM laporan
          GROUP BY kategori
        ) AS sub
      )
      ORDER BY jumlah DESC
    `;
    return rows;
  },
};

export default laporanRepository;