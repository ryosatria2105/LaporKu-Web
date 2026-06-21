// =============================================================
// STRATEGY PATTERN — refactoring.guru
// -------------------------------------------------------------
// Filter periode analitik bisa diganti dinamis tanpa mengubah
// logika chart yang sudah ada di DashboardAdminPage.
//
// Dua kelompok strategy:
// A) AnalitikPage  → harian / mingguan / bulanan / tahunan
// B) DashboardAdmin → 1hari / 7hari / 1bulan / 1tahun
// =============================================================

// ─────────────────────────────────────────────────────────────
// Abstract Strategy
// ─────────────────────────────────────────────────────────────
class PeriodeStrategy {
  process(laporanList, stats) { throw new Error('process() harus diimplementasikan'); }
  get nama()  { throw new Error('nama harus diimplementasikan'); }
  get label() { throw new Error('label harus diimplementasikan'); }
}

const BULAN = ['Jan','Feb','Mar','Apr','Mei','Jun',
               'Jul','Agu','Sep','Okt','Nov','Des'];

// ─────────────────────────────────────────────────────────────
// Kelompok A — untuk AnalitikPage
// ─────────────────────────────────────────────────────────────
class HarianStrategy extends PeriodeStrategy {
  get nama()  { return 'harian'; }
  get label() { return 'Harian'; }
  process(laporanList) {
    const map = {};
    laporanList.forEach(r => {
      const d = new Date(r.tanggal);
      const key = d.toISOString().split('T')[0];
      map[key] = { label: `${d.getDate()} ${BULAN[d.getMonth()]}`,
                   count: (map[key]?.count || 0) + 1 };
    });
    return Object.keys(map).sort().slice(-7).map(k => map[k]);
  }
}

class MingguanStrategy extends PeriodeStrategy {
  get nama()  { return 'mingguan'; }
  get label() { return 'Mingguan'; }
  process(laporanList) {
    const map = {};
    laporanList.forEach(r => {
      const d = new Date(r.tanggal);
      const start = new Date(d.getFullYear(), 0, 1);
      const week = Math.ceil(((d - start) / 86400000 + start.getDay() + 1) / 7);
      const key = `${d.getFullYear()}-W${String(week).padStart(2,'0')}`;
      map[key] = { label: `W${week} ${d.getFullYear()}`,
                   count: (map[key]?.count || 0) + 1 };
    });
    return Object.keys(map).sort().slice(-8).map(k => map[k]);
  }
}

class BulananStrategy extends PeriodeStrategy {
  get nama()  { return 'bulanan'; }
  get label() { return 'Bulanan'; }
  process(laporanList) {
    const map = {};
    laporanList.forEach(r => {
      const d = new Date(r.tanggal);
      const key = `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}`;
      map[key] = { label: `${BULAN[d.getMonth()]} ${d.getFullYear()}`,
                   count: (map[key]?.count || 0) + 1 };
    });
    return Object.keys(map).sort().slice(-6).map(k => map[k]);
  }
}

class TahunanStrategy extends PeriodeStrategy {
  get nama()  { return 'tahunan'; }
  get label() { return 'Tahunan'; }
  process(laporanList) {
    const map = {};
    laporanList.forEach(r => {
      const key = `${new Date(r.tanggal).getFullYear()}`;
      map[key] = { label: key, count: (map[key]?.count || 0) + 1 };
    });
    return Object.keys(map).sort().map(k => map[k]);
  }
}

// ─────────────────────────────────────────────────────────────
// Kelompok B — untuk DashboardAdminPage (chart tren laporan)
// ─────────────────────────────────────────────────────────────
class HariIniStrategy extends PeriodeStrategy {
  get nama()  { return '1hari'; }
  get label() { return 'Hari Ini'; }
  process(laporanList) {
    const now = new Date();
    const start = new Date(now);
    start.setHours(0, 0, 0, 0);
    const filtered = laporanList.filter(l => new Date(l.tanggal) >= start);
    const map = {};
    for (let h = 0; h < 24; h += 4) {
      const key = `${String(h).padStart(2, '0')}:00`;
      map[key] = 0;
    }
    filtered.forEach(l => {
      const d = new Date(l.tanggal);
      const h = Math.floor(d.getHours() / 4) * 4;
      const key = `${String(h).padStart(2, '0')}:00`;
      if (map[key] !== undefined) map[key]++;
    });
    return Object.entries(map).map(([label, count]) => ({ label, count }));
  }
}

class TujuhHariStrategy extends PeriodeStrategy {
  get nama()  { return '7hari'; }
  get label() { return '7 Hari'; }
  process(laporanList, stats) {
    // Pakai stats.aktivitas langsung (sudah diproses backend)
    return stats?.aktivitas || [];
  }
}

class SatuBulanStrategy extends PeriodeStrategy {
  get nama()  { return '1bulan'; }
  get label() { return '1 Bulan'; }
  process(laporanList) {
    const now = new Date();
    const map = {};
    for (let i = 29; i >= 0; i--) {
      const d = new Date(now);
      d.setDate(d.getDate() - i);
      d.setHours(0, 0, 0, 0);
      const key = d.toISOString().split('T')[0];
      map[key] = 0;
    }
    laporanList.forEach(l => {
      const key = new Date(l.tanggal).toISOString().split('T')[0];
      if (map[key] !== undefined) map[key]++;
    });
    return Object.entries(map)
      .filter((_, i) => i % 3 === 0)
      .map(([k, count]) => {
        const d = new Date(k);
        return { label: `${d.getDate()}/${d.getMonth() + 1}`, count };
      });
  }
}

class SatuTahunStrategy extends PeriodeStrategy {
  get nama()  { return '1tahun'; }
  get label() { return '1 Tahun'; }
  process(laporanList) {
    const now = new Date();
    const map = {};
    for (let i = 11; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      map[key] = { label: BULAN[d.getMonth()], count: 0 };
    }
    laporanList.forEach(l => {
      const d = new Date(l.tanggal);
      const key = `${d.getFullYear()}-${d.getMonth()}`;
      if (map[key]) map[key].count++;
    });
    return Object.values(map);
  }
}

// ─────────────────────────────────────────────────────────────
// Context — dipakai oleh komponen untuk jalankan strategy
// ─────────────────────────────────────────────────────────────
class AnalitikContext {
  constructor(strategy) { this._strategy = strategy; }
  setStrategy(strategy) { this._strategy = strategy; }
  get periodeNama()  { return this._strategy.nama; }
  get periodeLabel() { return this._strategy.label; }
  getData(laporanList, stats) { return this._strategy.process(laporanList, stats); }
}

// ─────────────────────────────────────────────────────────────
// Factory — satu entry point untuk buat strategy
// ─────────────────────────────────────────────────────────────
const PeriodeStrategyFactory = {
  create(periode) {
    const map = {
      // Kelompok A (AnalitikPage)
      harian:   new HarianStrategy(),
      mingguan: new MingguanStrategy(),
      bulanan:  new BulananStrategy(),
      tahunan:  new TahunanStrategy(),
      // Kelompok B (DashboardAdminPage)
      '1hari':  new HariIniStrategy(),
      '7hari':  new TujuhHariStrategy(),
      '1bulan': new SatuBulanStrategy(),
      '1tahun': new SatuTahunStrategy(),
    };
    return map[periode] || new BulananStrategy();
  },
};

export {
  PeriodeStrategy,
  HarianStrategy, MingguanStrategy, BulananStrategy, TahunanStrategy,
  HariIniStrategy, TujuhHariStrategy, SatuBulanStrategy, SatuTahunStrategy,
  AnalitikContext, PeriodeStrategyFactory,
};