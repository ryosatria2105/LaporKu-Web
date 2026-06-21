// components/ConfirmDeleteModal.jsx — i18n-ready, konsisten dengan tema LaporKu
// Font: Plus Jakarta Sans (sama dengan sistem)
// Style: inline CSS (sama dengan AlertPopup di DashboardUserPage)
export default function ConfirmDeleteModal({ judul, onConfirm, onCancel, darkMode, DK, lang }) {
  const dm = !!darkMode;
  const surface  = dm ? '#1E293B' : '#fff';
  const border   = dm ? '1px solid #334155' : '1px solid #030c1769';
  const text     = dm ? '#F1F5F9' : '#0F172A';
  const subtext  = dm ? '#94A3B8' : '#64748B';
  const bodyBg   = dm ? '#273449' : '#F8FAFC';
  const FF       = "'Plus Jakarta Sans', sans-serif";
  const isEn     = lang === 'en';

  return (
    <div
      onClick={onCancel}
      style={{
        position: 'fixed', inset: 0, zIndex: 99999,
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
          borderRadius: '16px',
          width: '100%', maxWidth: '360px',
          boxShadow: dm ? '0 4px 24px rgba(0,0,0,0.5)' : '0 4px 24px rgba(15,23,42,0.18)',
          border,
          overflow: 'hidden',
          fontFamily: FF,
        }}
      >
        {/* Header merah */}
        <div style={{
          padding: '28px 24px 18px',
          display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center',
          background: dm ? 'rgba(220,38,38,0.12)' : '#FFF0F0',
        }}>
          <div style={{
            width: '56px', height: '56px', borderRadius: '50%',
            background: dm ? 'rgba(220,38,38,0.2)' : '#FECACA',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            marginBottom: '14px',
          }}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="#DC2626" strokeWidth="2">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
              <line x1="10" y1="11" x2="10" y2="17"/>
              <line x1="14" y1="11" x2="14" y2="17"/>
            </svg>
          </div>
          <p style={{ fontSize: '17px', fontWeight: 800, color: '#991B1B', margin: '0 0 4px', fontFamily: FF }}>
            {isEn ? 'Delete Report?' : 'Hapus Laporan?'}
          </p>
          <p style={{ fontSize: '13px', color: '#DC2626', margin: 0 }}>
            {isEn ? 'This action cannot be undone' : 'Tindakan ini tidak dapat dibatalkan'}
          </p>
        </div>

        {/* Body */}
        <div style={{ padding: '16px 24px' }}>
          <div style={{
            padding: '11px 16px',
            background: bodyBg,
            borderRadius: '10px',
            border,
            textAlign: 'center',
            marginBottom: '10px',
          }}>
            <p style={{ fontSize: '14px', fontWeight: 600, color: text, margin: 0, fontFamily: FF }}>
              "{judul}"
            </p>
          </div>
          <p style={{ fontSize: '12px', color: subtext, textAlign: 'center', margin: 0, lineHeight: 1.6 }}>
            {isEn
              ? 'Report data and evidence photos will be permanently deleted from the system.'
              : 'Data laporan beserta foto bukti akan dihapus permanen dari sistem.'}
          </p>
        </div>

        {/* Actions */}
        <div style={{ display: 'flex', gap: '8px', padding: '0 24px 24px' }}>
          <button
            onClick={onCancel}
            style={{
              flex: 1, padding: '11px',
              border,
              background: 'transparent',
              color: dm ? '#94A3B8' : '#374151',
              fontSize: '14px', fontWeight: 700,
              cursor: 'pointer', fontFamily: FF,
              borderRadius: '10px', transition: 'background .15s',
            }}
            onMouseEnter={e => e.currentTarget.style.background = dm ? '#334155' : '#F8FAFC'}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
          >
            {isEn ? 'Cancel' : 'Batal'}
          </button>
          <button
            onClick={onConfirm}
            style={{
              flex: 1, padding: '11px',
              border: '2px solid #DC2626',
              background: '#EF4444',
              color: '#fff',
              fontSize: '14px', fontWeight: 700,
              cursor: 'pointer', fontFamily: FF,
              borderRadius: '10px', transition: 'background .15s',
              display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px',
            }}
            onMouseEnter={e => e.currentTarget.style.background = '#DC2626'}
            onMouseLeave={e => e.currentTarget.style.background = '#EF4444'}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
              <polyline points="3 6 5 6 21 6"/>
              <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a1 1 0 0 1 1-1h4a1 1 0 0 1 1 1v2"/>
            </svg>
            {isEn ? 'Yes, Delete' : 'Ya, Hapus'}
          </button>
        </div>
      </div>
    </div>
  );
}