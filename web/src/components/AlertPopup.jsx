// =============================================================
// AlertPopup — Reusable modal alert/confirm component (Web)
// Dipakai di: KategoriPage, ProfilPage, DashboardUserPage
//
// Props:
//   alert     {object|null} - { type: 'success'|'error'|'confirm'|'delete', title, message, confirmLabel? }
//   onClose   {function}    - callback tutup
//   onConfirm {function?}   - callback konfirmasi (untuk type confirm/delete)
// =============================================================

const B_MODAL = '1px solid #030c1769';

export default function AlertPopup({ alert, onClose, onConfirm }) {
  if (!alert) return null;
  const isConfirm = alert.type === 'confirm';
  const isDelete  = alert.type === 'delete';
  const isSuccess = alert.type === 'success';
  const isError   = alert.type === 'error';
  const cfg = {
    success: { iconColor: '#15803D', btnBg: '#059669', btnHover: '#047857', btnBorder: '#047857' },
    error:   { iconColor: '#DC2626', btnBg: '#EF4444', btnHover: '#DC2626', btnBorder: '#DC2626' },
    confirm: { iconColor: '#D97706', btnBg: '#D97706', btnHover: '#B45309', btnBorder: '#B45309' },
    delete:  { iconColor: '#DC2626', btnBg: '#EF4444', btnHover: '#DC2626', btnBorder: '#DC2626' },
  };
  const c = cfg[alert.type] || cfg.success;
  return (
    <div onClick={!isConfirm && !isDelete ? onClose : undefined} style={{ position: 'fixed', inset: 0, zIndex: 99999, background: 'rgba(15,23,42,0.5)', backdropFilter: 'blur(4px)', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }}>
      <div onClick={e => e.stopPropagation()} style={{ background: '#fff', borderRadius: '14px', width: '100%', maxWidth: '360px', boxShadow: '0 4px 24px rgba(15,23,42,0.18)', border: B_MODAL, overflow: 'hidden', fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
        <div style={{ padding: '28px 24px 16px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
          {isSuccess && <svg width="44" height="44" fill="none" viewBox="0 0 24 24" stroke={c.iconColor} strokeWidth={1.8} style={{ marginBottom: '14px' }}><path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>}
          {isError   && <svg width="44" height="44" fill="none" viewBox="0 0 24 24" stroke={c.iconColor} strokeWidth={1.8} style={{ marginBottom: '14px' }}><path strokeLinecap="round" strokeLinejoin="round" d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>}
          {isConfirm && <svg width="44" height="44" fill="none" viewBox="0 0 24 24" stroke={c.iconColor} strokeWidth={1.8} style={{ marginBottom: '14px' }}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>}
          {isDelete  && <svg width="44" height="44" fill="none" viewBox="0 0 24 24" stroke={c.iconColor} strokeWidth={1.8} style={{ marginBottom: '14px' }}><polyline points="3 6 5 6 21 6"/><path d="M19 6l-1 14a2 2 0 01-2 2H8a2 2 0 01-2-2L5 6"/><path d="M10 11v6M14 11v6"/><path d="M9 6V4h6v2"/></svg>}
          <p style={{ fontSize: '16px', fontWeight: 800, color: '#0F172A', margin: '0 0 8px' }}>{alert.title}</p>
          <p style={{ fontSize: '13px', color: '#64748B', lineHeight: 1.6, margin: 0 }}>{alert.message}</p>
        </div>
        <div style={{ display: 'flex', gap: '8px', padding: '0 24px 24px' }}>
          {(isConfirm || isDelete) ? (
            <>
              <button onClick={onClose} style={{ flex: 1, padding: '11px', border: B_MODAL, background: '#fff', color: '#374151', fontSize: '13px', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', borderRadius: '9px' }}
                onMouseEnter={e => e.currentTarget.style.background = '#F8FAFC'} onMouseLeave={e => e.currentTarget.style.background = '#fff'}>Batal</button>
              <button onClick={onConfirm} style={{ flex: 1, padding: '11px', border: `2px solid ${c.btnBorder}`, background: c.btnBg, color: '#fff', fontSize: '13px', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', borderRadius: '9px' }}
                onMouseEnter={e => e.currentTarget.style.background = c.btnHover} onMouseLeave={e => e.currentTarget.style.background = c.btnBg}>{alert.confirmLabel || 'Ya'}</button>
            </>
          ) : (
            <button onClick={onClose} style={{ flex: 1, padding: '11px', background: c.btnBg, border: `2px solid ${c.btnBorder}`, color: '#fff', fontSize: '14px', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit', borderRadius: '9px', transition: 'background .15s' }}
              onMouseEnter={e => e.currentTarget.style.background = c.btnHover} onMouseLeave={e => e.currentTarget.style.background = c.btnBg}>OK</button>
          )}
        </div>
      </div>
    </div>
  );
}
