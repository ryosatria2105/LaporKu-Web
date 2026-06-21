// components/LaporanCardSimple.jsx — Kartu laporan ringkas (Factory Product)
// Dipakai oleh LaporanFactory untuk laporan lama tanpa gambar
import React from "react";
import { parseTS, ago } from '../../utils/laporanHelpers';

const KATEGORI_COLOR = {
  Kecelakaan:    '#dc2626',
  Kriminal:      '#7c3aed',
  'Bencana Alam':'#2563eb',
  Pembangunan:   '#16a34a',
  Lainnya:       '#64748b',
}

const ICONS = {
  Kecelakaan: '🚨', Kriminal: '🔒', 'Bencana Alam': '🌊', Pembangunan: '🏗️', Lainnya: '📋'
}

export default function LaporanCardSimple({ data: r, onClick, onDelete, currentUserId, darkMode, DK }) {
  const dm = !!darkMode;
  const dk = DK || { surface:"#fff", text:"#0F172A", subtext:"#64748B", dimtext:"#94A3B8" };
  const color = KATEGORI_COLOR[r.kategori] || KATEGORI_COLOR.Lainnya

  return (
    <div
      onClick={onClick}
      className="group flex items-center gap-3 rounded-xl px-4 py-3 border cursor-pointer transition-all hover:shadow-sm relative"
      style={{ background: dm ? '#1E293B' : '#fff', borderColor: dm ? '#334155' : 'var(--border)', borderLeft: `3px solid ${color}` }}
    >
      {/* Ikon kecil */}
      <span className="text-base flex-shrink-0">{ICONS[r.kategori] || '📋'}</span>

      {/* Konten */}
      <div className="flex-1 min-w-0">
        <p className="text-[13px] font-semibold truncate" style={{ color: dk.text }}>
          {r.judul}
        </p>
        <div className="flex items-center gap-2 mt-0.5">
          <span className="text-[11px]" style={{ color: dk.dimtext }}>{r.nama}</span>
          <span className="text-[10px]" style={{ color: 'var(--border)' }}>•</span>
          <span className="text-[11px]" style={{ color: dk.dimtext }}>{ago(r.tanggal)}</span>
        </div>
      </div>

      {/* Hapus */}
      <button
        onClick={e => { e.stopPropagation(); onDelete() }}
        className="opacity-0 group-hover:opacity-100 w-6 h-6 rounded flex items-center justify-center transition-all hover:bg-red-50 hover:text-red-500 flex-shrink-0"
        style={{ color: '#EF4444' }}
        title="Hapus"
      >
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="3 6 5 6 21 6"/>
          <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
        </svg>
      </button>
    </div>
  )
}