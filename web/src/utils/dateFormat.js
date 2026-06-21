// =============================================================
// ATOMIC UTILITY — Date & Time Formatting (Web)
// -------------------------------------------------------------
// Single source of truth untuk semua format tanggal di web.
// Menggantikan fmtDate / fmtTime yang terduplikat di:
//   - LaporanDetail.jsx
//   - LaporanCard.jsx, LaporanCardImage.jsx, LaporanCardSimple.jsx
//   - DashboardUserPage.jsx (3 definisi berbeda)
//   - DashboardAdminPage.jsx (2 definisi)
//   - LaporanAdminPage.jsx
// =============================================================

/**
 * parseTS — parse timestamp string jadi Date, handle missing timezone
 * @param {string|Date} ts
 * @returns {Date|null}
 */
export function parseTS(ts) {
  if (!ts) return null;
  let s = String(ts);
  if (!s.endsWith('Z') && !s.includes('+') && !s.match(/[+-]\d{2}:\d{2}$/)) s += 'Z';
  const d = new Date(s);
  return isNaN(d.getTime()) ? null : d;
}

/**
 * relativeTime — "Baru saja", "5 menit lalu", "2 jam lalu", dst.
 * @param {string|Date} ts
 * @returns {string}
 */
export function relativeTime(ts) {
  const d = parseTS(ts);
  if (!d) return '-';
  const m = Math.floor((Date.now() - d.getTime()) / 60000);
  if (m < 1)    return 'Baru saja';
  if (m < 60)   return `${m} menit lalu`;
  if (m < 1440) return `${Math.floor(m / 60)} jam lalu`;
  if (m < 10080) return `${Math.floor(m / 1440)} hari lalu`;
  return `${Math.floor(m / 10080)} minggu lalu`;
}

/**
 * fmtDateShort — "14 Jun 2026"
 * @param {string|Date} ts
 * @param {'id'|'en'} lang
 * @returns {string}
 */
export function fmtDateShort(ts, lang = 'id') {
  if (!ts) return '—';
  const nd = parseTS(ts) || new Date(ts);
  const MONTHS_ID = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];
  const MONTHS_EN = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const mon = lang === 'en' ? MONTHS_EN[nd.getMonth()] : MONTHS_ID[nd.getMonth()];
  return `${nd.getDate()} ${mon} ${nd.getFullYear()}`;
}

/**
 * fmtDatetime — "14 Jun 2026, 09:30"
 * @param {string|Date} ts
 * @param {'id'|'en'} lang
 * @returns {string}
 */
export function fmtDatetime(ts, lang = 'id') {
  if (!ts) return '—';
  const nd = parseTS(ts) || new Date(ts);
  const MONTHS_ID = ['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'];
  const MONTHS_EN = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const mon = lang === 'en' ? MONTHS_EN[nd.getMonth()] : MONTHS_ID[nd.getMonth()];
  const hh = String(nd.getHours()).padStart(2, '0');
  const mn = String(nd.getMinutes()).padStart(2, '0');
  return `${nd.getDate()} ${mon} ${nd.getFullYear()}, ${hh}:${mn}`;
}

/**
 * fmtDateLong — "Sabtu, 14 Juni 2026 09:30"
 * @param {string|Date} ts
 * @returns {string}
 */
export function fmtDateLong(ts) {
  if (!ts) return '-';
  return new Date(ts).toLocaleDateString('id-ID', {
    weekday: 'long', day: 'numeric', month: 'long',
    year: 'numeric', hour: '2-digit', minute: '2-digit',
  });
}
