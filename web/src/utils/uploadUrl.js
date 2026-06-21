// Helper terpusat untuk path foto upload.
//
// Development (lokal): VITE_API_URL belum di-set → BASE = '' →
//   hasil "/uploads/nama.jpg" — SAMA PERSIS seperti sekarang, proxy Vite tetap menangani.
//
// Production (Vercel): VITE_API_URL = "https://xxx.up.railway.app/api/v1" →
//   BASE = "https://xxx.up.railway.app" → hasil "https://xxx.up.railway.app/uploads/nama.jpg"
//
// Tidak mengubah behavior development sama sekali — hanya menambah jalur untuk production.
const BASE = (import.meta.env.VITE_API_URL || '').replace('/api/v1', '');

export function uploadUrl(filename) {
    if (!filename) return '';
    if (filename.startsWith('http')) return filename; // sudah URL lengkap, jangan diubah
    const path = filename.startsWith('/uploads/') ? filename : `/uploads/${filename}`;
    return `${BASE}${path}`;
}