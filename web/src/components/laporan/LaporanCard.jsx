import React from "react";
// components/LaporanCard.jsx — Redesign: card bersih sesuai UI target
import { parseGambarFirst, parseTS, ago, getStatusCfg } from '../../utils/laporanHelpers';


const KAT_CFG = {
  default: { bg: '#F1F5F9', color: '#475569', border: '#CBD5E1' },
  Infrastruktur: { bg: '#EFF6FF', color: '#1D4ED8', border: '#BFDBFE' },
  Lingkungan:    { bg: '#ECFDF5', color: '#065F46', border: '#A7F3D0' },
  Keamanan:      { bg: '#FEF2F2', color: '#991B1B', border: '#FECACA' },
  Kesehatan:     { bg: '#FFF7ED', color: '#C2410C', border: '#FED7AA' },
  'Bencana Alam':{ bg: '#EFF6FF', color: '#1D4ED8', border: '#BFDBFE' },
  Kriminal:      { bg: '#F5F3FF', color: '#6D28D9', border: '#DDD6FE' },
  Pembangunan:   { bg: '#F0FDF4', color: '#166534', border: '#BBF7D0' },
};


export default function LaporanCard({ data: r, onClick, onDelete, currentUserId, darkMode, DK }) {
  const dm = !!darkMode;
  const dk = DK || { surface:"#fff", border:"1px solid #E2E8F0", text:"#0F172A", subtext:"#64748B", dimtext:"#94A3B8", surfaceHover:"#F8FAFC" };
  const sc = getStatusCfg(r.status);
  const kc = KAT_CFG[r.kategori] || KAT_CFG.default;
  const isOwner = !currentUserId || r.userId === currentUserId;
  const foto = parseGambarFirst(r.gambar);
  const BASE = (import.meta.env.VITE_API_URL || '').replace('/api/v1', '');

  const snippet = r.keterangan
    ? r.keterangan.slice(0, 120) + (r.keterangan.length > 120 ? '...' : '')
    : null;

  const formatLokasi = (lok) => {
    if (!lok) return null;
    const parts = lok.split(',');
    return parts.length >= 3 ? parts.slice(0, 3).join(',').trim() : lok;
  };

  return (
    <div
      onClick={onClick}
      style={{
        background: dk.surface, borderRadius: '12px',
        border: dm ? '1px solid #334155' : '1px solid #E2E8F0', boxShadow: dm ? '0 1px 3px rgba(0,0,0,0.3)' : '0 1px 3px rgba(15,23,42,0.06)',
        cursor: 'pointer', overflow: 'hidden', position: 'relative',
        transition: 'box-shadow .15s, transform .15s',
      }}
      onMouseEnter={e => { e.currentTarget.style.boxShadow = dm ? '0 4px 16px rgba(0,0,0,0.5)' : '0 4px 16px rgba(15,23,42,0.12)'; e.currentTarget.style.transform = 'translateY(-1px)'; }}
      onMouseLeave={e => { e.currentTarget.style.boxShadow = '0 1px 3px rgba(15,23,42,0.06)'; e.currentTarget.style.transform = 'translateY(0)'; }}
    >
      <div style={{ display: 'flex', alignItems: 'stretch' }}>

        {/* Foto kiri */}
        <div style={{
          width: '130px', minWidth: '130px', height: '130px',
          overflow: 'hidden', flexShrink: 0, background: dm ? '#1E293B' : '#F1F5F9',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
        }}>
          {foto
            ? <img
                src={`${BASE}/uploads/${foto}`}
                alt={r.judul}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                onError={e => {
                  e.target.style.display = 'none';
                  e.target.parentElement.innerHTML = '<div style="width:100%;height:100%;display:flex;align-items:center;justify-content:center;font-size:32px">📋</div>';
                }}
              />
            : <div style={{ fontSize: '32px' }}>📋</div>
          }
        </div>

        {/* Konten kanan */}
        <div style={{ flex: 1, padding: '14px 16px', minWidth: 0, display: 'flex', flexDirection: 'column', gap: '6px' }}>

          {/* Row 1: Badge status + kategori */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <span style={{ fontSize: '11px', fontWeight: 700, padding: '3px 10px', borderRadius: '6px', background: sc.bg, border: `1.5px solid ${sc.border}`, color: sc.color, whiteSpace: 'nowrap' }}>
              {sc.label}
            </span>
            <span style={{ fontSize: '11px', fontWeight: 600, padding: '3px 10px', borderRadius: '6px', background: kc.bg, border: `1.5px solid ${kc.border}`, color: kc.color, whiteSpace: 'nowrap' }}>
              {r.kategori}
            </span>
          </div>

          {/* Row 2: Judul */}
          <p style={{ fontSize: '14px', fontWeight: 800, color: dk.text, margin: 0, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontFamily: "'Plus Jakarta Sans',sans-serif" }}>
            {r.judul}
          </p>

          {/* Row 3: ID · Lokasi · Waktu */}
          <div style={{ display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '12px', fontSize: '11px', color: dk.dimtext }}>
            {r.id && (
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
                ID: LP-{String(r.id).slice(-8).replace(/^(\d+)(\d{3})$/, '$1-$2')}
              </span>
            )}
            {r.lokasi && (
              <span style={{ display: 'flex', alignItems: 'center', gap: '4px', maxWidth: '280px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/><circle cx="12" cy="10" r="3"/></svg>
                {formatLokasi(r.lokasi)}
              </span>
            )}
            <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
              {ago(r.tanggal)}
            </span>
          </div>

          {/* Row 4: Snippet keterangan */}
          {snippet && (
            <p style={{ fontSize: '12px', color: dk.subtext, margin: 0, lineHeight: 1.5, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
              {snippet}
            </p>
          )}
        </div>

        {/* Tombol hapus hover */}
        {isOwner && (
          <button
            onClick={e => { e.stopPropagation(); onDelete(); }}
            style={{
              position: 'absolute', top: '10px', right: '10px',
              display: 'flex', alignItems: 'center', gap: '4px',
              fontSize: '10px', fontWeight: 600, padding: '4px 8px',
              borderRadius: '6px', border: '1px solid #FECACA',
              background: '#FEF2F2', color: '#991B1B', cursor: 'pointer',
              opacity: 0, transition: 'opacity .15s', fontFamily: 'inherit',
            }}
            onMouseEnter={e => (e.currentTarget.style.opacity = '1')}
            onMouseLeave={e => (e.currentTarget.style.opacity = '0')}
            className="delete-btn"
          >
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="3 6 5 6 21 6"/><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/></svg>
            Hapus
          </button>
        )}
      </div>


      <style>{`.delete-btn:hover { opacity: 1 !important; }`}</style>
    </div>
  );
}