// OBSERVER PATTERN — refactoring.guru
import { prisma } from '../lib/prisma.js';

class NotifikasiObserver {
  async update(event, payload) {
    throw new Error('update() harus diimplementasikan');
  }
}

class AdminNotifier extends NotifikasiObserver {
  async update(event, payload) {
    if (event !== 'laporan.dibuat') return;
    const { laporanId, judul, nama, kategori } = payload;
    const admins = await prisma.user.findMany({
      where: { role: 'admin' }, select: { id: true },
    });
    await Promise.all(admins.map(admin =>
      prisma.notifikasi.create({
        data: {
          userId: admin.id,
          judul:  'Laporan Baru Masuk',
          pesan:  `"${judul}" dilaporkan oleh ${nama}. Kategori: ${kategori}.`,
          tipe:   'laporan_baru',
          laporanId,
        },
      })
    ));
  }
}

class UserNotifier extends NotifikasiObserver {
  async update(event, payload) {
    if (event !== 'laporan.status_berubah') return;
    const { laporanId, userId, judul, statusBaru, alasanPenolakan } = payload;
    const LABEL = { menunggu:'Menunggu', diproses:'Sedang Diproses',
                    selesai:'Selesai', ditolak:'Ditolak' };
    const PESAN = {
      diproses: `Laporan "${judul}" sedang diproses oleh petugas.`,
      selesai:  `Laporan "${judul}" telah selesai ditangani.`,
      ditolak:  alasanPenolakan
        ? `Laporan "${judul}" ditolak. Alasan: ${alasanPenolakan}`
        : `Laporan "${judul}" ditolak.`,
      menunggu: `Laporan "${judul}" dikembalikan ke status menunggu.`,
    };
    await prisma.notifikasi.create({
      data: {
        userId,
        judul: `Status Laporan: ${LABEL[statusBaru] || statusBaru}`,
        pesan: PESAN[statusBaru] || `Status diperbarui ke "${statusBaru}".`,
        tipe:  statusBaru === 'selesai' ? 'success'
             : statusBaru === 'ditolak' ? 'error' : 'info',
        laporanId,
      },
    });
  }
}

class NotifikasiEventBus {
  constructor() { this._observers = new Map(); }
  subscribe(event, observer) {
    if (!this._observers.has(event)) this._observers.set(event, []);
    this._observers.get(event).push(observer);
  }
  async notify(event, payload) {
    const list = this._observers.get(event) || [];
    await Promise.all(list.map(o => o.update(event, payload).catch(() => {})));
  }
}

const eventBus = new NotifikasiEventBus();
eventBus.subscribe('laporan.dibuat',         new AdminNotifier());
eventBus.subscribe('laporan.status_berubah', new UserNotifier());

export { NotifikasiObserver, AdminNotifier, UserNotifier,
         NotifikasiEventBus, eventBus };