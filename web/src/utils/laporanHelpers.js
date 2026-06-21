// =============================================================
// ATOMIC UTILITY — Laporan Helpers (Web)
// -------------------------------------------------------------
// Menggantikan fungsi yang terduplikat di:
//   - LaporanCard.jsx       (parseGambarFirst, parseTS, ago)
//   - LaporanCardImage.jsx  (parseGambarFirst, parseTS, ago)
//   - LaporanCardSimple.jsx (parseTS, ago)
//   - LaporanCard.jsx, LaporanDetail.jsx, DashboardAdminPage.jsx,
//     DashboardUserPage.jsx, LaporanAdminPage.jsx (STATUS_COLORS)
// =============================================================

import { parseTS, relativeTime } from './dateFormat';

/**
 * parseGambarFirst — ambil URL foto pertama dari field gambar (JSON string / string biasa)
 * @param {string|null} gambar
 * @returns {string|null}
 */
export function parseGambarFirst(gambar) {
  if (!gambar) return null;
  try {
    const p = JSON.parse(gambar);
    return Array.isArray(p) ? p[0] : gambar;
  } catch {
    return gambar;
  }
}

// re-export agar komponen lama tidak perlu ubah import dateFormat juga
export { parseTS, relativeTime as ago };

/**
 * STATUS_COLORS — warna per status laporan, single source of truth
 * Warna sengaja sedikit berbeda dari mobile (desain web punya palet sendiri)
 */
export const STATUS_COLORS = {
  semua:    { color: '#374151', bg: '#F9FAFB', border: '#E5E7EB' },
  menunggu: { color: '#B45309', bg: '#FFFBEB', border: '#FDE68A' },
  diproses: { color: '#6D28D9', bg: '#F5F3FF', border: '#DDD6FE' },
  selesai:  { color: '#065F46', bg: '#ECFDF5', border: '#A7F3D0' },
  ditolak:  { color: '#991B1B', bg: '#FEF2F2', border: '#FECACA' },
};

/**
 * getStatusCfg — kembalikan config warna + label
 * @param {string} status
 * @param {string} [label] - label override (dari i18n)
 * @returns {{ color, bg, border, label }}
 */
export function getStatusCfg(status, label) {
  const colors = STATUS_COLORS[status] || STATUS_COLORS.menunggu;
  return { ...colors, label: label || status };
}
