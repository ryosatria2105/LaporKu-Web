import React from "react";
// components/LaporanForm.jsx — v4
// Posisi: CENTER modal (bukan drawer)
// Style: iOS/Apple — sama persis dengan AlertPopup + modal lain di sistem
// Font: Plus Jakarta Sans
import { useState, useRef, useCallback } from 'react'
import { laporanService } from '../../services/api.service';

const FF = "'Plus Jakarta Sans', sans-serif";

export default function LaporanForm({ initial, onClose, onSaved, onError, kategoriList = [], darkMode, DK, lang }) {
  const dm     = !!darkMode;
  const isEdit = !!initial;
  const isEn   = lang === 'en';

  // Token warna — persis sama dengan sistem (AlertPopup, ProfilContent, dll)
  const surface    = dm ? '#1E293B' : '#fff';
  const surfaceHov = dm ? '#273449' : '#F8FAFC';
  const border     = dm ? '1px solid #334155' : '1px solid #030c1769';
  const text       = dm ? '#F1F5F9' : '#0F172A';
  const subtext    = dm ? '#94A3B8' : '#374151';
  const dimtext    = dm ? '#64748B' : '#94A3B8';
  const inputBg    = dm ? '#1E293B' : '#fff';
  const inputBdr   = dm ? '#475569' : '#CBD5E1';
  const headerBg   = '#1342b0';

  const [form, setForm] = useState({
    judul:      initial?.judul      || '',
    kategori:   initial?.kategori   || '',
    keterangan: initial?.keterangan || '',
    nama:       initial?.nama       || '',
    nohp:       initial?.nohp       || '',
    lokasi:     initial?.lokasi     || '',
  });
  const [errors, setErrors]   = useState({});
  const [loading, setLoading] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [existingFotos, setExistingFotos] = useState(() => {
    if (!initial) return [];
    if (Array.isArray(initial.fotos) && initial.fotos.length > 0)
      return initial.fotos
        .map(f => typeof f === 'string' ? f : f.url || '')
        .filter(Boolean)
        .map(u => u.startsWith('http') ? u : `/uploads/${u}`);
    if (initial.gambar) return [`/uploads/${initial.gambar}`];
    return [];
  });
  const [newFiles, setNewFiles]       = useState([]);
  const [newPreviews, setNewPreviews] = useState([]);
  const fileRef = useRef(null);
  const MAX     = 5;
  const totalFoto = existingFotos.length + newFiles.length;

  const set = k => e => setForm(f => ({ ...f, [k]: e.target.value }));

  const validate = () => {
    const e = {};
    if (!form.judul.trim())      e.judul      = isEn ? 'Title is required'       : 'Judul wajib diisi';
    if (!form.kategori)          e.kategori   = isEn ? 'Select a category'       : 'Pilih kategori';
    if (!form.keterangan.trim()) e.keterangan = isEn ? 'Description is required' : 'Keterangan wajib diisi';
    if (!form.nama.trim())       e.nama       = isEn ? 'Reporter name required'  : 'Nama pelapor wajib diisi';
    setErrors(e);
    return !Object.keys(e).length;
  };

  const handleFileChange = useCallback(e => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    const sisa = MAX - totalFoto;
    if (sisa <= 0) { onError(isEn ? `Max ${MAX} photos` : `Maksimal ${MAX} foto`); e.target.value = ''; return; }
    const toAdd  = files.slice(0, sisa);
    const valid  = [];
    const readers = [];
    toAdd.forEach(file => {
      if (file.size > 5 * 1024 * 1024) { onError(`${file.name}: ${isEn ? 'exceeds 5MB' : 'melebihi 5MB'}`); return; }
      valid.push(file);
      const r = new FileReader();
      readers.push(new Promise(res => { r.onload = ev => res(ev.target.result); r.readAsDataURL(file); }));
    });
    Promise.all(readers).then(previews => {
      setNewFiles(p => [...p, ...valid]);
      setNewPreviews(p => [...p, ...previews]);
    });
    e.target.value = '';
  }, [totalFoto, onError, isEn]);

  const removeExisting = idx => setExistingFotos(p => p.filter((_, i) => i !== idx));
  const removeNew      = idx => {
    setNewFiles(p => p.filter((_, i) => i !== idx));
    setNewPreviews(p => p.filter((_, i) => i !== idx));
  };

  const handleSubmitRequest = () => { if (!validate()) return; setShowConfirm(true); };

  const handleSubmit = async () => {
    setShowConfirm(false);
    setLoading(true);
    try {
      const fd = new FormData();
      fd.append('judul',      form.judul.trim());
      fd.append('kategori',   form.kategori);
      fd.append('keterangan', form.keterangan.trim());
      fd.append('nama',       form.nama.trim());
      fd.append('nohp',       form.nohp?.trim() || '');
      fd.append('lokasi',     form.lokasi?.trim() || '');
      existingFotos.forEach(url => fd.append('existingFotos[]', url.replace('/uploads/', '')));
      newFiles.forEach(file => fd.append('gambar', file));
      if (initial?.id) await laporanService.update(initial.id, fd);
      else             await laporanService.create(fd);
      onSaved();
    } catch (err) {
      onError(err.response?.data?.message || (isEn ? 'Failed to save.' : 'Gagal menyimpan laporan.'));
    } finally {
      setLoading(false);
    }
  };

  const allPreviews = [
    ...existingFotos.map(url => ({ url, isExisting: true })),
    ...newPreviews.map((url, i) => ({ url, isExisting: false, newIdx: i })),
  ];

  // Input style — sama persis dengan form profil di sistem
  const iStyle = (err = false) => ({
    width: '100%', padding: '10px 13px',
    border: `2px solid ${err ? '#EF4444' : inputBdr}`,
    borderRadius: '9px', fontSize: '13px',
    fontFamily: FF, outline: 'none',
    background: inputBg, color: text,
    boxSizing: 'border-box',
    transition: 'border-color .15s, box-shadow .15s',
  });
  const onFcs = e => {
    e.target.style.borderColor = '#1a56db';
    e.target.style.boxShadow   = '0 0 0 3px rgba(26,86,219,0.1)';
  };
  const onBlr = (err = false) => e => {
    e.target.style.borderColor = err ? '#EF4444' : inputBdr;
    e.target.style.boxShadow   = 'none';
  };
  const lblSt = {
    fontSize: '11px', fontWeight: 700, letterSpacing: '0.8px',
    textTransform: 'uppercase', color: subtext,
    display: 'block', marginBottom: '6px', fontFamily: FF,
  };
  const errSt = { fontSize: '11px', color: '#EF4444', margin: '4px 0 0', fontFamily: FF };

  return (
    <>
      {/* ══ BACKDROP ══ */}
      <div
        onClick={onClose}
        style={{
          position: 'fixed', inset: 0, zIndex: 9000,
          background: 'rgba(15,23,42,0.55)',
          backdropFilter: 'blur(4px)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          padding: '20px',
        }}
      >
        {/* ══ MODAL CARD — center, iOS style ══ */}
        <div
          onClick={e => e.stopPropagation()}
          style={{
            background: surface,
            borderRadius: '16px',
            width: '100%', maxWidth: '540px',
            maxHeight: '90vh',
            boxShadow: dm
              ? '0 20px 60px rgba(0,0,0,0.6)'
              : '0 8px 40px rgba(15,23,42,0.22)',
            border,
            overflow: 'hidden',
            display: 'flex', flexDirection: 'column',
            fontFamily: FF,
          }}
        >
          {/* ── Header ── */}
          <div style={{
            display: 'flex', alignItems: 'center', justifyContent: 'space-between',
            padding: '16px 20px',
            background: headerBg,
            flexShrink: 0,
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '30px', height: '30px', borderRadius: '8px',
                background: 'rgba(255,255,255,.18)',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
              }}>
                {isEdit ? (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                  </svg>
                ) : (
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2.2">
                    <line x1="12" y1="5" x2="12" y2="19"/>
                    <line x1="5" y1="12" x2="19" y2="12"/>
                  </svg>
                )}
              </div>
              <h3 style={{ fontSize: '15px', fontWeight: 800, color: '#fff', margin: 0, fontFamily: FF }}>
                {isEdit ? (isEn ? 'Edit Report' : 'Edit Laporan') : (isEn ? 'Create Report' : 'Buat Laporan Baru')}
              </h3>
            </div>
            <button onClick={onClose} style={{
              width: '28px', height: '28px', borderRadius: '50%',
              border: 'none', background: 'rgba(255,255,255,.18)',
              cursor: 'pointer', color: '#fff',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '14px', lineHeight: 1, transition: 'background .15s',
            }}
              onMouseEnter={e => e.currentTarget.style.background = 'rgba(255,255,255,.28)'}
              onMouseLeave={e => e.currentTarget.style.background = 'rgba(255,255,255,.18)'}
            >×</button>
          </div>

          {/* ── Body scroll ── */}
          <div style={{ flex: 1, overflowY: 'auto', padding: '20px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '15px' }}>

              {/* Judul */}
              <div>
                <label style={lblSt}>{isEn ? 'Title' : 'Judul'} <span style={{ color: '#EF4444' }}>*</span></label>
                <input value={form.judul} onChange={set('judul')}
                  placeholder={isEn ? 'Eg: Damaged Road on Pemuda St.' : 'Contoh: Jalan Rusak di Jl. Pemuda'}
                  style={iStyle(!!errors.judul)}
                  onFocus={onFcs} onBlur={onBlr(!!errors.judul)}
                />
                {errors.judul && <p style={errSt}>{errors.judul}</p>}
              </div>

              {/* Kategori */}
              <div>
                <label style={lblSt}>{isEn ? 'Category' : 'Kategori'} <span style={{ color: '#EF4444' }}>*</span></label>
                <select value={form.kategori} onChange={set('kategori')}
                  style={{ ...iStyle(!!errors.kategori), appearance: 'none', cursor: 'pointer' }}
                  onFocus={onFcs} onBlur={onBlr(!!errors.kategori)}
                >
                  <option value="">{isEn ? '— Select Category —' : '— Pilih Kategori —'}</option>
                  {kategoriList.map(k => <option key={k.id} value={k.nama}>{k.nama}</option>)}
                </select>
                {errors.kategori && <p style={errSt}>{errors.kategori}</p>}
              </div>

              {/* Nama + HP */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={lblSt}>{isEn ? 'Reporter' : 'Nama Pelapor'} <span style={{ color: '#EF4444' }}>*</span></label>
                  <input value={form.nama} onChange={set('nama')}
                    placeholder={isEn ? 'Full name' : 'Nama lengkap'}
                    style={iStyle(!!errors.nama)}
                    onFocus={onFcs} onBlur={onBlr(!!errors.nama)}
                  />
                  {errors.nama && <p style={errSt}>{errors.nama}</p>}
                </div>
                <div>
                  <label style={lblSt}>{isEn ? 'Phone' : 'Nomor HP'}</label>
                  <input value={form.nohp} onChange={set('nohp')} type="tel"
                    placeholder="08xxxxxxxxxx"
                    style={iStyle()}
                    onFocus={onFcs} onBlur={onBlr()}
                  />
                </div>
              </div>

              {/* Lokasi */}
              <div>
                <label style={lblSt}>{isEn ? 'Location' : 'Lokasi'}</label>
                <input
                  value={form.lokasi.includes('::') ? form.lokasi.split('::')[0] : form.lokasi}
                  onChange={e => setForm(f => ({ ...f, lokasi: e.target.value }))}
                  placeholder={isEn ? 'Street name, village, or landmark' : 'Nama jalan, kelurahan, atau patokan'}
                  style={iStyle()}
                  onFocus={onFcs} onBlur={onBlr()}
                />
              </div>

              {/* Keterangan */}
              <div>
                <label style={lblSt}>{isEn ? 'Description' : 'Keterangan'} <span style={{ color: '#EF4444' }}>*</span></label>
                <textarea value={form.keterangan} onChange={set('keterangan')} rows={4}
                  placeholder={isEn ? 'Describe the incident in detail...' : 'Jelaskan detail kejadian, lokasi, waktu...'}
                  style={{ ...iStyle(!!errors.keterangan), resize: 'none' }}
                  onFocus={onFcs} onBlur={onBlr(!!errors.keterangan)}
                />
                {errors.keterangan && <p style={errSt}>{errors.keterangan}</p>}
              </div>

              {/* Foto */}
              <div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                  <label style={{ ...lblSt, margin: 0 }}>{isEn ? 'Evidence Photos' : 'Foto Bukti'}</label>
                  <span style={{
                    fontSize: '11px', fontWeight: 700,
                    padding: '2px 8px', borderRadius: '20px',
                    background: totalFoto >= MAX
                      ? '#FEF2F2'
                      : (dm ? 'rgba(26,86,219,.15)' : '#EFF6FF'),
                    color: totalFoto >= MAX ? '#DC2626' : '#1a56db',
                    border: `1.5px solid ${totalFoto >= MAX ? '#FECACA' : '#BFDBFE'}`,
                    fontFamily: FF,
                  }}>
                    {totalFoto}/{MAX} {isEn ? 'photos' : 'foto'}
                  </span>
                </div>

                <input ref={fileRef} type="file"
                  accept="image/jpeg,image/jpg,image/png,image/webp"
                  multiple style={{ display: 'none' }} onChange={handleFileChange}
                />

                {allPreviews.length > 0 ? (
                  <>
                    <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: '8px', marginBottom: '6px' }}>
                      {allPreviews.map((item, i) => (
                        <div key={i} style={{
                          position: 'relative', borderRadius: '8px',
                          overflow: 'hidden', aspectRatio: '1', border,
                        }}>
                          <img src={item.url} alt=""
                            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
                          />
                          {/* badge */}
                          <div style={{ position: 'absolute', top: '3px', left: '3px' }}>
                            <span style={{
                              fontSize: '8px', fontWeight: 700,
                              padding: '1px 5px', borderRadius: '4px',
                              background: item.isExisting ? 'rgba(0,0,0,.55)' : 'rgba(22,163,74,.85)',
                              color: '#fff', fontFamily: FF,
                            }}>
                              {item.isExisting ? (isEn ? 'saved' : 'tersimpan') : (isEn ? 'new' : 'baru')}
                            </span>
                          </div>
                          {/* tombol hapus foto */}
                          <button
                            onClick={() => item.isExisting
                              ? removeExisting(existingFotos.indexOf(item.url))
                              : removeNew(item.newIdx)
                            }
                            style={{
                              position: 'absolute', top: '3px', right: '3px',
                              width: '18px', height: '18px', borderRadius: '50%',
                              background: 'rgba(239,68,68,.9)', border: 'none',
                              cursor: 'pointer', color: '#fff', opacity: 0,
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              transition: 'opacity .15s',
                            }}
                            onMouseEnter={e => e.currentTarget.style.opacity = '1'}
                            onMouseLeave={e => e.currentTarget.style.opacity = '0'}
                          >
                            <svg width="8" height="8" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                              <line x1="18" y1="6" x2="6" y2="18"/>
                              <line x1="6" y1="6" x2="18" y2="18"/>
                            </svg>
                          </button>
                        </div>
                      ))}
                      {totalFoto < MAX && (
                        <button onClick={() => fileRef.current?.click()} style={{
                          aspectRatio: '1',
                          border: `2px dashed ${dm ? '#475569' : '#CBD5E1'}`,
                          borderRadius: '8px', background: 'transparent',
                          cursor: 'pointer',
                          display: 'flex', flexDirection: 'column',
                          alignItems: 'center', justifyContent: 'center', gap: '3px',
                          color: dimtext, transition: 'all .15s',
                        }}
                          onMouseEnter={e => {
                            e.currentTarget.style.borderColor = '#1a56db';
                            e.currentTarget.style.background  = dm ? 'rgba(26,86,219,.12)' : '#EFF6FF';
                          }}
                          onMouseLeave={e => {
                            e.currentTarget.style.borderColor = dm ? '#475569' : '#CBD5E1';
                            e.currentTarget.style.background  = 'transparent';
                          }}
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="12" y1="5" x2="12" y2="19"/>
                            <line x1="5" y1="12" x2="19" y2="12"/>
                          </svg>
                          <span style={{ fontSize: '9px', fontWeight: 600, fontFamily: FF }}>
                            {isEn ? 'Add' : 'Tambah'}
                          </span>
                        </button>
                      )}
                    </div>
                    <p style={{ fontSize: '11px', color: dimtext, margin: 0, fontFamily: FF }}>
                      {isEn ? 'Hover to remove · Click + to add' : 'Hover foto untuk hapus · Klik + untuk tambah'}
                    </p>
                  </>
                ) : (
                  <button onClick={() => fileRef.current?.click()} style={{
                    width: '100%',
                    border: `2px dashed ${dm ? '#475569' : '#CBD5E1'}`,
                    borderRadius: '9px', padding: '20px',
                    background: dm ? '#1E293B' : '#F8FAFC',
                    cursor: 'pointer', textAlign: 'center',
                    transition: 'all .15s', minHeight: '100px',
                    display: 'flex', flexDirection: 'column',
                    alignItems: 'center', justifyContent: 'center',
                  }}
                    onMouseEnter={e => {
                      e.currentTarget.style.borderColor = '#1a56db';
                      e.currentTarget.style.background  = dm ? 'rgba(26,86,219,.12)' : '#EFF6FF';
                    }}
                    onMouseLeave={e => {
                      e.currentTarget.style.borderColor = dm ? '#475569' : '#CBD5E1';
                      e.currentTarget.style.background  = dm ? '#1E293B' : '#F8FAFC';
                    }}
                  >
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#94A3B8" strokeWidth="1.5"
                      style={{ marginBottom: '6px' }}>
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                      <polyline points="17 8 12 3 7 8"/>
                      <line x1="12" y1="3" x2="12" y2="15"/>
                    </svg>
                    <p style={{ fontSize: '12px', fontWeight: 700, color: subtext, margin: '0 0 2px', fontFamily: FF }}>
                      {isEn ? `Click to select photos (max. ${MAX})` : `Klik untuk pilih foto (maks. ${MAX})`}
                    </p>
                    <p style={{ fontSize: '11px', color: dimtext, margin: 0, fontFamily: FF }}>
                      JPG, PNG, WEBP — {isEn ? 'max 5MB each' : 'maks. 5MB/foto'}
                    </p>
                  </button>
                )}
              </div>

            </div>
          </div>

          {/* ── Footer ── */}
          <div style={{
            display: 'flex', gap: '8px',
            padding: '14px 20px',
            borderTop: border,
            background: dm ? '#273449' : '#F8FAFC',
            flexShrink: 0,
          }}>
            <button onClick={onClose} style={{
              flex: 1, padding: '10px 16px',
              border,
              background: 'transparent',
              color: subtext, fontSize: '13px', fontWeight: 700,
              cursor: 'pointer', fontFamily: FF,
              borderRadius: '9px', transition: 'background .15s',
            }}
              onMouseEnter={e => e.currentTarget.style.background = surfaceHov}
              onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            >
              {isEn ? 'Cancel' : 'Batal'}
            </button>
            <button onClick={handleSubmitRequest} disabled={loading} style={{
              flex: 2, padding: '10px 16px',
              background: loading ? '#93C5FD' : '#1a56db',
              border: 'none', color: '#fff',
              fontSize: '13px', fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer',
              fontFamily: FF, borderRadius: '9px',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '7px',
              transition: 'background .15s',
            }}
              onMouseEnter={e => { if (!loading) e.currentTarget.style.background = '#1342b0'; }}
              onMouseLeave={e => { if (!loading) e.currentTarget.style.background = '#1a56db'; }}
            >
              {loading ? (
                <>
                  <span style={{
                    width: '12px', height: '12px',
                    border: '2px solid rgba(255,255,255,.4)',
                    borderTopColor: '#fff', borderRadius: '50%',
                    display: 'inline-block',
                    animation: 'spin 0.8s linear infinite',
                  }}/>
                  {isEdit ? (isEn ? 'Updating...' : 'Memperbarui...') : (isEn ? 'Submitting...' : 'Menyimpan...')}
                </>
              ) : (
                <>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                  {isEdit ? (isEn ? 'Update' : 'Perbarui') : (isEn ? 'Submit Report' : 'Simpan Laporan')}
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* ══ MODAL KONFIRMASI (center juga, sama style AlertPopup sistem) ══ */}
      {showConfirm && (
        <div
          onClick={() => setShowConfirm(false)}
          style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            background: 'rgba(15,23,42,0.55)',
            backdropFilter: 'blur(4px)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            padding: '20px',
          }}
        >
          <div
            onClick={e => e.stopPropagation()}
            style={{
              background: surface,
              borderRadius: '14px',
              width: '100%', maxWidth: '360px',
              boxShadow: dm
                ? '0 4px 24px rgba(0,0,0,0.5)'
                : '0 4px 24px rgba(15,23,42,0.18)',
              border: dm ? '1px solid #334155' : '1px solid #030c1769',
              overflow: 'hidden',
              fontFamily: FF,
            }}
          >
            {/* icon + judul */}
            <div style={{
              padding: '28px 24px 16px',
              display: 'flex', flexDirection: 'column',
              alignItems: 'center', textAlign: 'center',
            }}>
              <div style={{ marginBottom: '14px' }}>
                {isEdit ? (
                  <svg width="44" height="44" fill="none" viewBox="0 0 24 24" stroke="#D97706" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round"
                      d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                    <path strokeLinecap="round" strokeLinejoin="round"
                      d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                  </svg>
                ) : (
                  <svg width="44" height="44" fill="none" viewBox="0 0 24 24" stroke="#1a56db" strokeWidth={1.8}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M22 2L11 13"/>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M22 2L15 22 11 13 2 9l20-7z"/>
                  </svg>
                )}
              </div>
              <p style={{ fontSize: '16px', fontWeight: 800, color: text, margin: '0 0 8px', fontFamily: FF }}>
                {isEdit
                  ? (isEn ? 'Update Report?' : 'Perbarui Laporan?')
                  : (isEn ? 'Submit Report?' : 'Kirim Laporan?')}
              </p>
              <p style={{ fontSize: '13px', color: '#64748B', lineHeight: 1.6, margin: 0, fontFamily: FF }}>
                {isEdit
                  ? (isEn ? 'Make sure your changes are correct before updating.' : 'Pastikan perubahan sudah benar sebelum memperbarui.')
                  : (isEn ? 'Make sure all information is correct before submitting.' : 'Pastikan semua informasi sudah benar sebelum dikirim.')}
              </p>
            </div>

            {/* tombol — persis sama dengan AlertPopup sistem */}
            <div style={{ display: 'flex', gap: '8px', padding: '0 24px 24px' }}>
              <button onClick={() => setShowConfirm(false)} style={{
                flex: 1, padding: '11px',
                border: dm ? '1px solid #334155' : '1px solid #030c1769',
                background: '#fff', color: '#374151',
                fontSize: '13px', fontWeight: 700,
                cursor: 'pointer', fontFamily: FF,
                borderRadius: '9px', transition: 'background .15s',
              }}
                onMouseEnter={e => e.currentTarget.style.background = '#F8FAFC'}
                onMouseLeave={e => e.currentTarget.style.background = '#fff'}
              >
                {isEn ? 'Cancel' : 'Batal'}
              </button>
              <button onClick={handleSubmit} style={{
                flex: 1, padding: '11px',
                border: `2px solid ${isEdit ? '#B45309' : '#1342b0'}`,
                background: isEdit ? '#D97706' : '#1a56db',
                color: '#fff',
                fontSize: '13px', fontWeight: 700,
                cursor: 'pointer', fontFamily: FF,
                borderRadius: '9px',
                display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
                transition: 'background .15s',
              }}
                onMouseEnter={e => e.currentTarget.style.background = isEdit ? '#B45309' : '#1342b0'}
                onMouseLeave={e => e.currentTarget.style.background = isEdit ? '#D97706' : '#1a56db'}
              >
                {isEdit ? (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <polyline points="20 6 9 17 4 12"/>
                  </svg>
                ) : (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M22 2L11 13"/><path d="M22 2L15 22 11 13 2 9l20-7z"/>
                  </svg>
                )}
                {isEdit ? (isEn ? 'Yes, Update' : 'Ya, Perbarui') : (isEn ? 'Yes, Submit' : 'Ya, Kirim')}
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}