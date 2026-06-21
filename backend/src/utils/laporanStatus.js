// =============================================================
// STATE PATTERN  (Behavioral — refactoring.guru)
// -------------------------------------------------------------
// Setiap status laporan punya aturan transisi sendiri.
// Mencegah transisi ilegal, misal: selesai → menunggu.
// Admin tidak bisa sembarangan ubah status tanpa aturan.
// =============================================================

const states = {
  menunggu: {
    label: 'Menunggu',
    color: 'amber',
    allowedTransitions: ['diproses', 'ditolak'],
  },
  diproses: {
    label: 'Diproses',
    color: 'purple',
    allowedTransitions: ['selesai', 'ditolak', 'menunggu'],
  },
  selesai: {
    label: 'Selesai',
    color: 'green',
    allowedTransitions: [],          // final state
  },
  ditolak: {
    label: 'Ditolak',
    color: 'red',
    allowedTransitions: ['menunggu'], // bisa dibuka ulang
  },
};

export const VALID_STATUSES = Object.keys(states);

export function canTransition(current, next) {
  const state = states[current];
  if (!state) return false;
  return state.allowedTransitions.includes(next);
}

export function getAllowedTransitions(current) {
  return states[current]?.allowedTransitions || [];
}

export function getStateInfo(status) {
  return states[status] || null;
}