import api from '../utils/api';

// =============================================================
// FACADE PATTERN  (Structural Pattern — refactoring.guru)
// -------------------------------------------------------------
// Satu entry point untuk semua akses API.
// Komponen tidak perlu tahu endpoint, method, atau header.
// =============================================================

// ── Kategori ─────────────────────────────────────────────────
export const kategoriService = {
  getAll:  ()         => api.get('/kategori'),
  create:  (data)     => api.post('/kategori', data),
  update:  (id, data) => api.put(`/kategori/${id}`, data),
  remove:  (id)       => api.delete(`/kategori/${id}`),
};

// ── Profil ────────────────────────────────────────────────────
export const profilService = {
  getData: () =>
    api.get('/profil'),

  updateData: (form) =>
    api.patch('/profil', form),

  updatePassword: (data) =>
    api.patch('/profil/password', data),

  deleteAkun: () =>
    api.delete('/profil/akun'),

  uploadFoto: (file) => {
    const fd = new FormData();
    fd.append('foto', file);
    return api.post('/profil/foto', fd, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },

  deleteFoto: () => api.delete('/profil/foto'),
};

// ── Laporan ───────────────────────────────────────────────────
export const laporanService = {
  getAll:  (params = {}) => api.get('/laporan', { params }),
  getMy:   ()            => api.get('/laporan/my'),

  create: (formData) =>
    api.post('/laporan', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  update: (id, formData) =>
    api.put(`/laporan/${id}`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    }),

  remove:      (id) => api.delete(`/laporan/${id}`),
  adminDelete: (id) => api.delete(`/laporan/${id}/admin`),
  restore:     (id) => api.patch(`/laporan/${id}/restore`),

  getStats: () => api.get('/laporan/stats'),

  getAdmin: (params = {}) => api.get('/laporan/admin', { params }),

  updateStatus: (id, status, alasanPenolakan) =>
    api.patch(`/laporan/${id}/status`, { status, alasanPenolakan }),
};

// ── Pengguna ──────────────────────────────────────────────────
export const penggunaService = {
  getAll:       ()   => api.get('/pengguna'),
  toggleActive: (id) => api.patch(`/pengguna/${id}/toggle-active`),
};

// ── Notifikasi ────────────────────────────────────────────────
export const notifikasiService = {
  getAll:    ()   => api.get('/notifikasi'),
  baca:      (id) => api.patch(`/notifikasi/${id}/baca`),
  bacaSemua: ()   => api.patch('/notifikasi/baca-semua'),
  hapus:     (id) => api.delete(`/notifikasi/${id}`),
};
// ── Analytics ─────────────────────────────────────────────────
export const analyticsService = {
  trackVisit:     (data)      => api.post('/analytics/visit', data),
  updateDuration: (sessionId, durationSec) =>
    api.patch(`/analytics/visit/${sessionId}/duration`, { duration_sec: durationSec }),
  getStats:       ()          => api.get('/analytics/visitors'),
  getTable:       (page = 1, perPage = 15) =>
    api.get(`/analytics/visitors/table?page=${page}&per_page=${perPage}`),
  exportCsv:      ()          => api.get('/analytics/visitors/csv', { responseType: 'blob' }),
};

// ── Auth ──────────────────────────────────────────────────────
export const authService = {
  me:     () => api.get('/auth/me'),
  logout: () => api.post('/auth/logout'),
};