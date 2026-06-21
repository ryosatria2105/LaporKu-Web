import React from "react";
// components/LaporanCardImage.jsx — Kartu laporan dengan foto besar (Factory Product)
// Dipakai oleh LaporanFactory ketika laporan punya gambar
import { parseGambarFirst, parseTS, ago } from '../../utils/laporanHelpers';

const BADGE = {
  Kecelakaan:    { bg: '#fef2f2', color: '#dc2626', border: 'rgba(220,38,38,.2)' },
  Kriminal:      { bg: '#f5f3ff', color: '#7c3aed', border: 'rgba(124,58,237,.2)' },
  'Bencana Alam':{ bg: '#eff6ff', color: '#2563eb', border: 'rgba(37,99,235,.2)' },
  Pembangunan:   { bg: '#f0fdf4', color: '#16a34a', border: 'rgba(22,163,74,.2)' },
  Lainnya:       { bg: '#f8fafc', color: '#64748b', border: 'rgba(100,116,139,.2)' },
}

export default function LaporanCardImage({ data: r, onClick, onDelete, currentUserId, darkMode, DK }) {
  const dm = !!darkMode;
  const dk = DK || { surface:"#fff", text:"#0F172A", subtext:"#64748B", dimtext:"#94A3B8" };
  const b = BADGE[r.kategori] || BADGE.Lainnya
  const isOwner = !currentUserId || r.userId === currentUserId
  const isUpdated = r.updatedAt && r.tanggal &&
    Math.abs(new Date(r.updatedAt) - new Date(r.tanggal)) > 5000

  return (
    <div
      onClick={onClick}
      className="group rounded-xl border overflow-hidden cursor-pointer transition-all hover:shadow-lg hover:-translate-y-0.5 relative"
      style={{ background: dm ? '#1E293B' : '#fff', borderColor: dm ? '#334155' : 'var(--border)' }}
    >
      {/* Foto besar di atas */}
      <div className="relative h-36 overflow-hidden bg-slate-100">
        <img
          src={`/uploads/${parseGambarFirst(r.gambar)}`}
          alt={r.judul}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
          onError={e => { e.target.parentElement.style.background = 'var(--navy-lt)' }}
        />
        {/* Overlay gradient */}
        <div className="absolute inset-0"
          style={{ background: 'linear-gradient(to top, rgba(0,0,0,.5) 0%, transparent 60%)' }} />

        {/* Badge kategori di atas foto */}
        <div className="absolute top-2.5 left-3">
          <span className="text-[10.5px] font-bold px-2.5 py-1 rounded-full border"
            style={{ background: b.bg, color: b.color, borderColor: b.border }}>
            {r.kategori}
          </span>
        </div>

        {/* Badge diperbarui */}
        {isUpdated && (
          <div className="absolute top-2.5 right-3 flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold text-white"
            style={{ background: 'rgba(217,119,6,.85)' }}>
            <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
              <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
            </svg>
            Diperbarui
          </div>
        )}

        {/* Waktu di bawah foto */}
        <div className="absolute bottom-2 right-3 text-[10px] text-white/80 font-medium">
          {ago(r.tanggal)}
        </div>
      </div>

      {/* Konten bawah */}
      <div className="p-3.5 flex items-start justify-between gap-2">
        <div className="flex-1 min-w-0">
          <p className="text-[13.5px] font-bold truncate mb-0.5"
            style={{ fontFamily: "'Plus Jakarta Sans', sans-serif", color: dk.text }}>
            {r.judul}
          </p>
          <p className="text-[11.5px] truncate" style={{ color: dk.dimtext }}>
            {r.nama}
          </p>
          <p className="text-[12px] truncate mt-1" style={{ color: dk.subtext }}>
            {r.keterangan}
          </p>
        </div>

        {/* Tombol hapus */}
        <button
          onClick={e => { e.stopPropagation(); onDelete() }}
          className="opacity-0 group-hover:opacity-100 flex-shrink-0 w-7 h-7 rounded-lg flex items-center justify-center transition-all hover:bg-red-50 hover:text-red-600"
          style={{ color: 'var(--muted)', display: isOwner ? '' : 'none' }}
          title="Hapus laporan"
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="3 6 5 6 21 6"/>
            <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
          </svg>
        </button>
      </div>
    </div>
  )
}