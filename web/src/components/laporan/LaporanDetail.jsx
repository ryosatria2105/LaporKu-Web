import React from "react";
// components/LaporanDetail.jsx — v2: gallery multi-foto, lightbox, lock saat sudah diproses
import { useState } from 'react'
import { parseTS, ago } from '../../utils/laporanHelpers';
import { fmtDateLong } from '../../utils/dateFormat';

// fmtDate → fmtDateLong dari utils/dateFormat (no duplicate)
const fmtDate = (ts) => {
  const d = parseTS(ts);
  if (!d) return '—';
  return d.toLocaleString('id-ID', {
    day: 'numeric', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit', timeZone: 'Asia/Jakarta'
  }) + ' WIB';
};

const BADGE = {
  Kecelakaan:    { bg: '#fef2f2', color: '#dc2626', border: 'rgba(220,38,38,.2)' },
  Kriminal:      { bg: '#f5f3ff', color: '#7c3aed', border: 'rgba(124,58,237,.2)' },
  'Bencana Alam':{ bg: '#eff6ff', color: '#2563eb', border: 'rgba(37,99,235,.2)' },
  Pembangunan:   { bg: '#f0fdf4', color: '#16a34a', border: 'rgba(22,163,74,.2)' },
  Kebersihan:    { bg: '#fefce8', color: '#ca8a04', border: 'rgba(202,138,4,.2)' },
  Lainnya:       { bg: '#f8fafc', color: '#64748b', border: 'rgba(100,116,139,.2)' },
}

const STATUS_CFG = {
  Menunggu:  { bg: '#fefce8', color: '#92400e', border: '#fde68a', dot: '#d97706', label: 'Menunggu' },
  Diproses:  { bg: '#eff6ff', color: '#1e40af', border: '#bfdbfe', dot: '#2563eb', label: 'Diproses' },
  Selesai:   { bg: '#f0fdf4', color: '#14532d', border: '#a7f3d0', dot: '#059669', label: 'Selesai' },
  Ditolak:   { bg: '#fef2f2', color: '#7f1d1d', border: '#fecaca', dot: '#dc2626', label: 'Ditolak' },
}

// Status yang sudah "diproses admin" — user tidak bisa edit/hapus
const LOCKED_STATUSES = ['Diproses', 'Selesai', 'Ditolak']

// ── Helper: ambil list URL foto ──────────────────────────────
function getFotoList(r) {
  if (Array.isArray(r.fotos) && r.fotos.length > 0) {
    return r.fotos.map(f => (typeof f === 'string' ? f : f.url || f.path || '')).filter(Boolean).map(u => u.startsWith('http') ? u : `/uploads/${u}`)
  }
  if (r.gambar) return [`/uploads/${r.gambar}`]
  return []
}

// ── Modal Konfirmasi Hapus ────────────────────────────────────
function ConfirmHapus({ judul, onConfirm, onCancel, dm, dk }) {
  const borderColor = dm ? '#334155' : '#E2E8F0'
  return (
    <div
      className="fixed inset-0 z-[300] flex items-center justify-center p-4"
      style={{ background: 'rgba(15,23,42,.6)', backdropFilter: 'blur(4px)' }}
    >
      <div
        className="rounded-2xl w-full max-w-sm overflow-hidden"
        style={{ background: dk.surface, boxShadow: '0 20px 60px rgba(0,0,0,.3)' }}
      >
        <div className="px-6 pt-6 pb-4 text-center"
          style={{ background: dm ? 'rgba(220,38,38,0.15)' : 'linear-gradient(135deg, #fee2e2 0%, #fef2f2 100%)' }}>
          <div className="mx-auto mb-3 w-14 h-14 rounded-full flex items-center justify-center"
            style={{ background: dm ? 'rgba(220,38,38,0.2)' : '#fecaca' }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
              <line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/>
            </svg>
          </div>
          <h3 className="text-lg font-bold mb-1" style={{ fontFamily: 'Instrument Sans', color: '#991b1b' }}>Hapus Laporan?</h3>
          <p className="text-sm" style={{ color: '#dc2626' }}>Tindakan ini tidak dapat dibatalkan</p>
        </div>
        <div className="px-6 py-4">
          <div className="rounded-lg px-4 py-3 text-sm text-center font-medium"
            style={{ background: dm ? 'rgba(255,255,255,0.06)' : '#f8fafc', border: `1px solid ${borderColor}`, color: dk.subtext }}>
            "{judul}"
          </div>
          <p className="text-center text-xs mt-3" style={{ color: dk.dimtext }}>
            Data laporan beserta foto bukti akan dihapus permanen dari sistem.
          </p>
        </div>
        <div className="flex gap-3 px-6 pb-6">
          <button onClick={onCancel}
            className="flex-1 h-11 rounded-xl text-sm font-semibold transition-all"
            style={{ border: `1.5px solid ${borderColor}`, background: 'transparent', color: dk.subtext }}>
            Batal
          </button>
          <button onClick={onConfirm}
            className="flex-1 h-11 rounded-xl text-sm font-bold text-white flex items-center justify-center gap-2 transition-all hover:opacity-90 active:scale-[.98]"
            style={{ background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', boxShadow: '0 4px 14px rgba(220,38,38,.35)' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
            </svg>
            Ya, Hapus
          </button>
        </div>
      </div>
    </div>
  )
}

// ── Lightbox — popup lihat foto besar ────────────────────────
function Lightbox({ fotos, startIndex, onClose }) {
  const [idx, setIdx] = useState(startIndex)
  const total = fotos.length
  const prev = () => setIdx(i => (i - 1 + total) % total)
  const next = () => setIdx(i => (i + 1) % total)

  return (
    <div
      className="fixed inset-0 z-[400] flex flex-col"
      style={{ background: 'rgba(5,10,20,.95)', backdropFilter: 'blur(8px)' }}
      onClick={onClose}
    >
      {/* Top bar */}
      <div className="flex items-center justify-between px-5 py-3 flex-shrink-0"
        style={{ background: 'rgba(255,255,255,.05)' }}
        onClick={e => e.stopPropagation()}>
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center"
            style={{ background: 'rgba(255,255,255,.12)' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
              <polyline points="21 15 16 10 5 21"/>
            </svg>
          </div>
          <span className="text-white text-sm font-semibold">Foto Bukti</span>
          <span className="text-white/40 text-xs">•</span>
          <span className="text-white/60 text-xs">{idx + 1} / {total}</span>
        </div>
        <button
          onClick={onClose}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-white/60 hover:text-white hover:bg-white/15 transition-all"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
            <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
          </svg>
        </button>
      </div>

      {/* Main foto */}
      <div className="flex-1 flex items-center justify-center relative px-14 py-4"
        onClick={e => e.stopPropagation()}>
        {total > 1 && (
          <button onClick={prev}
            className="absolute left-3 w-10 h-10 rounded-xl flex items-center justify-center transition-all hover:bg-white/20"
            style={{ background: 'rgba(255,255,255,.1)' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
          </button>
        )}

        <img
          key={idx}
          src={fotos[idx]}
          alt={`foto ${idx + 1}`}
          style={{
            maxWidth: '100%', maxHeight: '100%',
            objectFit: 'contain',
            borderRadius: '12px',
            boxShadow: '0 8px 40px rgba(0,0,0,.6)',
          }}
        />

        {total > 1 && (
          <button onClick={next}
            className="absolute right-3 w-10 h-10 rounded-xl flex items-center justify-center transition-all hover:bg-white/20"
            style={{ background: 'rgba(255,255,255,.1)' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
              <polyline points="9 18 15 12 9 6"/>
            </svg>
          </button>
        )}
      </div>

      {/* Thumbnail strip */}
      {total > 1 && (
        <div className="flex items-center justify-center gap-2 px-5 pb-4 flex-shrink-0"
          onClick={e => e.stopPropagation()}>
          {fotos.map((url, i) => (
            <button
              key={i}
              onClick={() => setIdx(i)}
              className="relative rounded-lg overflow-hidden flex-shrink-0 transition-all"
              style={{
                width: '52px', height: '40px',
                border: i === idx ? '2px solid white' : '2px solid rgba(255,255,255,.2)',
                opacity: i === idx ? 1 : 0.55,
              }}
            >
              <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
            </button>
          ))}
        </div>
      )}
    </div>
  )
}

// ── Main Component ────────────────────────────────────────────
export default function LaporanDetail({ data: r, onClose, onEdit, onDelete, currentUserId, darkMode, DK }) {
  const dm = !!darkMode
  const dk = DK || {
    bg: '#F1F5F9', surface: '#fff', surfaceHover: '#F8FAFC',
    border: '1px solid #030c1769', text: '#0F172A', subtext: '#374151',
    dimtext: '#64748B', inputBg: '#fff', cardShadow: '0 1px 4px rgba(8,18,42,0.44)',
    headerBg: '#fff', sidebarBg: '#0F172A'
  }
  const pBorder = dm ? '1px solid #334155' : '1px solid #030c1769'
  const infoCardBg = dm ? 'rgba(255,255,255,0.04)' : '#f8fafc'

  const b = BADGE[r.kategori] || BADGE.Lainnya
  const sc = STATUS_CFG[r.status] || STATUS_CFG.Menunggu
  const [showConfirm, setShowConfirm] = useState(false)
  const [lightboxIdx, setLightboxIdx] = useState(null)
  const [activeThumb, setActiveThumb] = useState(0)

  const isOwner = !currentUserId || r.userId === currentUserId
  const isLocked = LOCKED_STATUSES.includes(r.status)

  const isUpdated = r.updatedAt && r.tanggal &&
    Math.abs(new Date(r.updatedAt) - new Date(r.tanggal)) > 5000

  const fotos = getFotoList(r)
  const mainFoto = fotos[activeThumb] || null

  const handleDelete = () => {
    setShowConfirm(false)
    onDelete()
  }

  return (
    <>
      <div
        className="fixed inset-0 z-[200] flex items-center justify-end"
        style={{ background: 'rgba(15,23,42,.5)', backdropFilter: 'blur(3px)' }}
        onClick={e => e.target === e.currentTarget && onClose()}
      >
        <div
          className="w-[500px] max-w-[95vw] h-full flex flex-col"
          style={{
            background: dk.surface,
            borderLeft: `3px solid ${dm ? '#2563EB' : '#1342b0'}`,
            boxShadow: '-8px 0 40px rgba(0,0,0,.2)',
            animation: 'slideIn .25s ease',
          }}
        >
          {/* ── Header ── */}
          <div className="flex items-center justify-between px-6 py-5"
            style={{ background: 'linear-gradient(135deg, #1342b0 0%, #1a56db 100%)' }}>
            <div>
              <h3 className="text-base font-bold text-white" style={{ fontFamily: 'Instrument Sans' }}>Detail Laporan</h3>
              <p className="text-[11px] text-white/55 mt-0.5">ID: {r.id}</p>
            </div>
            <button onClick={onClose}
              className="w-8 h-8 rounded-lg flex items-center justify-center text-white/70 hover:text-white hover:bg-white/20 transition-all">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                <line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/>
              </svg>
            </button>
          </div>

          {/* ── Body ── */}
          <div className="flex-1 overflow-y-auto">

            {/* ── GALLERY FOTO ── */}
            {fotos.length > 0 ? (
              <div>
                <div
                  className="relative cursor-zoom-in"
                  style={{ background: '#0f172a' }}
                  onClick={() => setLightboxIdx(activeThumb)}
                >
                  <img
                    src={mainFoto}
                    alt="foto laporan"
                    className="w-full object-cover block"
                    style={{ height: '220px' }}
                  />
                  <div className="absolute inset-0"
                    style={{ background: 'linear-gradient(to top, rgba(0,0,0,.5) 0%, rgba(0,0,0,.1) 50%, transparent 100%)' }} />

                  <div className="absolute bottom-3 left-4">
                    <span className="text-[10.5px] font-bold px-2.5 py-1 rounded-full border"
                      style={{ background: b.bg, color: b.color, borderColor: b.border }}>
                      {r.kategori}
                    </span>
                  </div>

                  <div className="absolute top-3 right-3">
                    <div className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-white text-[10px] font-semibold"
                      style={{ background: 'rgba(0,0,0,.5)', backdropFilter: 'blur(6px)' }}>
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                        <circle cx="12" cy="12" r="3"/>
                      </svg>
                      Lihat foto
                    </div>
                  </div>

                  {fotos.length > 1 && (
                    <div className="absolute bottom-3 right-4 text-[10px] font-bold px-2 py-0.5 rounded-full text-white"
                      style={{ background: 'rgba(0,0,0,.55)' }}>
                      {fotos.length} foto
                    </div>
                  )}
                </div>

                {fotos.length > 1 && (
                  <div className="flex gap-2 px-4 py-3" style={{ background: infoCardBg, borderBottom: pBorder }}>
                    {fotos.map((url, i) => (
                      <button
                        key={i}
                        onClick={() => setActiveThumb(i)}
                        className="relative rounded-lg overflow-hidden flex-shrink-0 transition-all hover:opacity-100"
                        style={{
                          width: '52px', height: '44px',
                          border: i === activeThumb ? '2px solid #2563EB' : `2px solid ${dm ? '#334155' : '#E2E8F0'}`,
                          opacity: i === activeThumb ? 1 : 0.6,
                        }}
                      >
                        <img src={url} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                      </button>
                    ))}
                    <button
                      onClick={() => setLightboxIdx(activeThumb)}
                      className="flex-shrink-0 rounded-lg flex flex-col items-center justify-center gap-0.5 transition-all"
                      style={{
                        width: '52px', height: '44px',
                        border: `2px dashed ${dm ? '#334155' : '#E2E8F0'}`,
                        background: 'transparent',
                        color: '#2563EB',
                      }}
                      onMouseEnter={e => e.currentTarget.style.background = dm ? '#273449' : '#F1F5F9'}
                      onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
                    >
                      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="3" width="18" height="18" rx="2"/>
                        <circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
                      </svg>
                      <span style={{ fontSize: '8px', fontWeight: 700 }}>Galeri</span>
                    </button>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-8 px-4"
                style={{ background: infoCardBg, borderBottom: pBorder }}>
                <div className="w-14 h-14 rounded-xl flex items-center justify-center mb-2"
                  style={{ background: dm ? '#273449' : '#e2e8f0' }}>
                  <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={dm ? '#475569' : '#94a3b8'} strokeWidth="1.5">
                    <rect x="3" y="3" width="18" height="18" rx="2"/>
                    <circle cx="8.5" cy="8.5" r="1.5"/><polyline points="21 15 16 10 5 21"/>
                  </svg>
                </div>
                <p className="text-xs" style={{ color: dk.dimtext }}>Tidak ada foto bukti</p>
              </div>
            )}

            {/* ── Info utama ── */}
            <div className="p-6">

              {fotos.length === 0 && (
                <span className="inline-block text-[10.5px] font-bold px-2.5 py-1 rounded-full border mb-4"
                  style={{ background: b.bg, color: b.color, borderColor: b.border }}>
                  {r.kategori}
                </span>
              )}

              <div className="flex items-start justify-between gap-3 mb-4">
                <h2 className="text-[1.05rem] font-bold flex-1"
                  style={{ fontFamily: 'Instrument Sans', color: dk.text, lineHeight: 1.35 }}>
                  {r.judul}
                </h2>
                <span className="flex-shrink-0 flex items-center gap-1.5 text-[11px] font-bold px-3 py-1 rounded-full"
                  style={{ background: sc.bg, color: sc.color, border: `1px solid ${sc.border}` }}>
                  <span className="w-1.5 h-1.5 rounded-full flex-shrink-0" style={{ background: sc.dot }} />
                  {sc.label}
                </span>
              </div>

              {isLocked && isOwner && (
                <div className="flex items-start gap-3 rounded-xl px-4 py-3 mb-5"
                  style={{ background: dm ? 'rgba(146,64,14,0.15)' : '#fffbeb', border: `1px solid ${dm ? '#78350f' : '#fde68a'}` }}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#92400e" strokeWidth="2" className="flex-shrink-0 mt-0.5">
                    <rect x="3" y="11" width="18" height="11" rx="2"/>
                    <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                  </svg>
                  <div>
                    <p className="text-[11.5px] font-bold" style={{ color: '#92400e' }}>Laporan Dikunci</p>
                    <p className="text-[11px] mt-0.5" style={{ color: '#b45309' }}>
                      Laporan sudah <strong>{r.status}</strong> oleh admin — tidak dapat diedit atau dihapus.
                    </p>
                  </div>
                </div>
              )}

              {/* ── Timeline waktu ── */}
              <div className="rounded-xl p-4 mb-5"
                style={{ background: dm ? 'rgba(37,99,235,0.1)' : '#eff6ff', border: `1px solid ${dm ? 'rgba(37,99,235,0.25)' : 'rgba(26,86,219,.12)'}` }}>
                <p className="text-[10px] font-bold uppercase tracking-wider mb-3"
                  style={{ color: '#2563EB', fontFamily: 'Instrument Sans' }}>Riwayat Waktu</p>

                <div className="flex items-start gap-3">
                  <div className="flex flex-col items-center">
                    <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ background: '#2563EB', color: 'white' }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                      </svg>
                    </div>
                    {isUpdated && <div className="w-[2px] h-6 my-1" style={{ background: '#2563EB' }} />}
                  </div>
                  <div className="flex-1 pb-1">
                    <p className="text-[11px] font-bold" style={{ color: '#2563EB' }}>Dibuat</p>
                    <p className="text-[12px] font-medium" style={{ color: dk.text }}>{fmtDate(r.tanggal)}</p>
                    <p className="text-[11px]" style={{ color: dk.dimtext }}>{ago(r.tanggal)}</p>
                  </div>
                </div>

                {isUpdated && (
                  <div className="flex items-start gap-3 mt-1">
                    <div className="w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0"
                      style={{ background: '#D97706', color: 'white' }}>
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                      </svg>
                    </div>
                    <div className="flex-1">
                      <p className="text-[11px] font-bold" style={{ color: '#D97706' }}>Terakhir Diperbarui</p>
                      <p className="text-[12px] font-medium" style={{ color: dk.text }}>{fmtDate(r.updatedAt)}</p>
                      <p className="text-[11px]" style={{ color: dk.dimtext }}>{ago(r.updatedAt)}</p>
                    </div>
                  </div>
                )}
                {!isUpdated && (
                  <p className="text-[11px] mt-2 ml-10" style={{ color: dk.dimtext }}>Belum pernah diperbarui</p>
                )}
              </div>

              {/* ── Detail grid 2 kolom ── */}
              <div className="grid grid-cols-2 gap-3 mb-4">
                {[
                  { label: 'Pelapor', value: r.nama },
                  { label: 'No. HP', value: r.nohp || '—' },
                ].map(row => (
                  <div key={row.label} className="rounded-xl px-4 py-3"
                    style={{ background: infoCardBg, border: pBorder }}>
                    <p className="text-[10px] font-bold uppercase tracking-wider mb-1"
                      style={{ color: dk.dimtext, fontFamily: 'Instrument Sans' }}>{row.label}</p>
                    <p className="text-[13px] font-bold" style={{ color: dk.text }}>{row.value}</p>
                  </div>
                ))}
              </div>

              {r.lokasi && (
                <div className="rounded-xl px-4 py-3 mb-4"
                  style={{ background: infoCardBg, border: pBorder }}>
                  <p className="text-[10px] font-bold uppercase tracking-wider mb-1"
                    style={{ color: dk.dimtext, fontFamily: 'Instrument Sans' }}>Lokasi</p>
                  <p className="text-[13px] font-bold" style={{ color: dk.text }}>{r.lokasi}</p>
                </div>
              )}

              <div className="flex gap-3 py-3 border-t" style={{ borderColor: dm ? '#334155' : '#E2E8F0' }}>
                <div className="flex-shrink-0 w-5 h-5 flex items-center justify-center mt-0.5"
                  style={{ color: '#2563EB' }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/>
                    <polyline points="14 2 14 8 20 8"/>
                    <line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/>
                  </svg>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-[10.5px] font-bold uppercase tracking-wider mb-0.5"
                    style={{ color: dk.dimtext, fontFamily: 'Instrument Sans' }}>Keterangan</p>
                  <p className="text-sm whitespace-pre-wrap" style={{ color: dk.subtext }}>{r.keterangan}</p>
                </div>
              </div>

            </div>
          </div>

          {/* ── Footer Aksi ── */}
          <div className="flex items-center gap-2 px-6 py-4 border-t"
            style={{ background: dk.surface, borderColor: dm ? '#334155' : '#E2E8F0' }}>
            <button onClick={onClose}
              className="px-4 py-2.5 rounded-xl text-sm font-semibold transition-all"
              style={{ border: pBorder, color: dk.subtext, background: 'transparent' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = '#2563EB'; e.currentTarget.style.color = '#2563EB'; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = dm ? '#334155' : '#E2E8F0'; e.currentTarget.style.color = dk.subtext; }}>
              Tutup
            </button>

            {isOwner && !isLocked && (
              <>
                <button onClick={onEdit}
                  className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all"
                  style={{ background: dm ? 'rgba(217,119,6,0.15)' : '#FEF3C7', color: '#D97706', border: `1.5px solid ${dm ? 'rgba(217,119,6,0.3)' : '#FDE68A'}` }}
                  onMouseEnter={e => { e.currentTarget.style.background = '#D97706'; e.currentTarget.style.color = '#fff'; }}
                  onMouseLeave={e => { e.currentTarget.style.background = dm ? 'rgba(217,119,6,0.15)' : '#FEF3C7'; e.currentTarget.style.color = '#D97706'; }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                  </svg>
                  Edit
                </button>

                <button onClick={() => setShowConfirm(true)}
                  className="ml-auto flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold text-white transition-all hover:opacity-90 active:scale-[.98]"
                  style={{ background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)', boxShadow: '0 4px 14px rgba(220,38,38,.3)' }}>
                  <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="3 6 5 6 21 6"/>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
                  </svg>
                  Hapus
                </button>
              </>
            )}

            {isOwner && isLocked && (
              <div className="ml-auto flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold"
                style={{ background: dm ? 'rgba(100,116,139,0.15)' : 'rgba(100,116,139,.08)', color: dk.dimtext, border: pBorder }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
                Dikunci oleh admin
              </div>
            )}

            {!isOwner && (
              <div className="ml-auto flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-semibold"
                style={{ background: dm ? 'rgba(100,116,139,0.15)' : 'rgba(100,116,139,.08)', color: dk.dimtext, border: pBorder }}>
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <rect x="3" y="11" width="18" height="11" rx="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
                Laporan milik pengguna lain
              </div>
            )}
          </div>
        </div>
      </div>

      {showConfirm && (
        <ConfirmHapus judul={r.judul} onConfirm={handleDelete} onCancel={() => setShowConfirm(false)} dm={dm} dk={dk} />
      )}

      {lightboxIdx !== null && (
        <Lightbox fotos={fotos} startIndex={lightboxIdx} onClose={() => setLightboxIdx(null)} />
      )}
    </>
  )
}