import { useState, useEffect, useRef } from 'react';
import AlertPopup from '../components/AlertPopup';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { profilService } from '../services/api.service';
import logoDark from '../assets/logo-darkmode.png';

// ─── ALERT POPUP ───────────────────────────────────────────────
const B_MODAL = '1px solid #030c1769';
// AlertPopup → import dari components/AlertPopup (no duplicate)


// ─── EYE BUTTON ────────────────────────────────────────────────
const EyeBtn = ({ show, toggle }) => (
  <button type="button" onClick={toggle} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#9CA3AF', padding: 0, display: 'flex' }}>
    <svg width="15" height="15" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
      <path strokeLinecap="round" strokeLinejoin="round" d={show
        ? "M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
        : "M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"} />
    </svg>
  </button>
);

// ─── INPUT COMPONENT ───────────────────────────────────────────
const Input = ({ label, value, onChange, type = 'text', placeholder, disabled, rightEl, hint, darkMode, DK }) => (
  <div>
    <label style={{ fontSize: '12px', fontWeight: 600, color: disabled ? DK.dimtext : DK.subtext, display: 'block', marginBottom: '6px' }}>{label}</label>
    <div style={{ position: 'relative' }}>
      <input type={type} value={value} onChange={onChange} placeholder={placeholder} disabled={disabled}
        style={{
          width: '100%', padding: rightEl ? '10px 40px 10px 12px' : '10px 12px',
          border: `2px solid ${disabled ? (darkMode ? '#334155' : '#F3F4F6') : (darkMode ? '#475569' : '#E5E7EB')}`,
          borderRadius: '9px', fontSize: '13px', fontFamily: 'inherit',
          outline: 'none', boxSizing: 'border-box', transition: 'border-color .15s',
          background: disabled ? (darkMode ? '#0F172A' : '#F9FAFB') : DK.inputBg,
          color: disabled ? DK.dimtext : DK.text,
        }}
        onFocus={e => { if (!disabled) e.target.style.borderColor = '#2563EB'; }}
        onBlur={e => { if (!disabled) e.target.style.borderColor = darkMode ? '#475569' : '#E5E7EB'; }}
      />
      {rightEl && <div style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)' }}>{rightEl}</div>}
    </div>
    {hint && <p style={{ fontSize: '11px', color: DK.dimtext, margin: '5px 0 0' }}>{hint}</p>}
  </div>
);

export default function ProfilPage() {
  const { user, setUser, refreshUser, logout } = useAuth();
  const navigate = useNavigate();
  const [darkMode, setDarkMode] = useState(() => localStorage.getItem('laporku_dark') === 'true');
  const DK = darkMode ? {
    bg: '#0F172A', surface: '#1E293B', surfaceHover: '#273449',
    border: '1px solid #334155', text: '#F1F5F9', subtext: '#94A3B8',
    dimtext: '#64748B', inputBg: '#1E293B', cardShadow: '0 1px 4px rgba(0,0,0,0.6)',
    headerBg: '#1E293B', sidebarBg: '#070D1A'
  } : {
    bg: '#EEF2F7', surface: '#fff', surfaceHover: '#F8FAFC',
    border: '1px solid #C9D1DA', text: '#111827', subtext: '#374151',
    dimtext: '#9CA3AF', inputBg: '#fff', cardShadow: '0 1px 4px rgba(15,23,42,0.06)',
    headerBg: '#fff', sidebarBg: '#0F172A'
  };
  const [activeTab, setActiveTab] = useState('profil');
  const [form, setForm] = useState({ nama: '', phone: '' });
  const [passForm, setPassForm] = useState({ password_lama: '', password_baru: '', konfirmasi_password: '' });
  const [showPass, setShowPass] = useState({ lama: false, baru: false, konfirmasi: false });
  const [loading, setLoading] = useState(false);
  const [loadingFoto, setLoadingFoto] = useState(false);
  const [alert, setAlert] = useState(null);
  const fileRef = useRef();

  const showAlert = (data) => setAlert(data);

  useEffect(() => {
    profilService.getData().then(res => {
      setForm({ nama: res.data.data.nama || '', phone: res.data.data.phone || '' });
    });
  }, []);



  const handleUpdateProfil = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await profilService.updateData(form);
      setUser(prev => ({ ...prev, nama: res.data.data.nama, phone: res.data.data.phone }));
      showAlert({ type: 'success', title: 'Profil Diperbarui!', message: 'Data profil Anda berhasil disimpan.' });
    } catch (err) {
      showAlert({ type: 'error', title: 'Gagal!', message: err.response?.data?.message || 'Gagal memperbarui profil.' });
    } finally { setLoading(false); }
  };

  const handleUpdatePassword = async (e) => {
    e.preventDefault();
    if (passForm.password_baru !== passForm.konfirmasi_password)
      return showAlert({ type: 'error', title: 'Gagal!', message: 'Password baru tidak sama.' });
    if (passForm.password_baru.length < 8)
      return showAlert({ type: 'error', title: 'Gagal!', message: 'Password minimal 8 karakter.' });
    setLoading(true);
    try {
      await profilService.updatePassword(passForm);
      setPassForm({ password_lama: '', password_baru: '', konfirmasi_password: '' });
      showAlert({ type: 'success', title: 'Password Diperbarui!', message: 'Password Anda berhasil diperbarui.' });
    } catch (err) {
      showAlert({ type: 'error', title: 'Gagal!', message: err.response?.data?.message || 'Gagal memperbarui password.' });
    } finally { setLoading(false); }
  };

  const handleUploadFoto = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const fd = new FormData();
    fd.append('foto', file);
    setLoadingFoto(true);
    try {
      await profilService.uploadFoto(file);
      await refreshUser();
      showAlert({ type: 'success', title: 'Foto Diperbarui!', message: 'Foto profil Anda berhasil diperbarui.' });
    } catch {
      showAlert({ type: 'error', title: 'Gagal!', message: 'Gagal mengupload foto profil.' });
    } finally { setLoadingFoto(false); }
  };

  const initials = user?.nama?.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() || 'U';
  const dashboardRoute = user?.role === 'admin' ? '/dashboard/admin' : '/dashboard/user';

  const B = DK.border;
  const BL = darkMode ? '1px solid #334155' : '1.5px solid #DDE3EA';

  const strength = passForm.password_baru.length === 0 ? 0
    : passForm.password_baru.length >= 8 && /[A-Z]/.test(passForm.password_baru) && /[0-9]/.test(passForm.password_baru) && /[^a-zA-Z0-9]/.test(passForm.password_baru) ? 4
    : passForm.password_baru.length >= 8 && (/[A-Z]/.test(passForm.password_baru) || /[0-9]/.test(passForm.password_baru)) ? 3
    : passForm.password_baru.length >= 8 ? 2 : 1;
  const strengthColors = ['#E5E7EB', '#EF4444', '#F59E0B', '#3B82F6', '#059669'];
  const strengthLabels = ['', 'Lemah', 'Cukup', 'Kuat', 'Sangat Kuat'];

  const TABS = [
    { id: 'profil',   label: 'Data Profil',    icon: <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/></svg> },
    { id: 'password', label: 'Keamanan',        icon: <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg> },
  ];

  return (
    <div style={{ minHeight: '100vh', background: DK.bg, fontFamily: "'Plus Jakarta Sans', sans-serif" }}>
      {alert && <AlertPopup alert={alert} onClose={() => setAlert(null)} />}

      {/* Topbar */}
      <header style={{ background: DK.headerBg, borderBottom: B, padding: '0 32px', height: '60px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', position: 'sticky', top: 0, zIndex: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button onClick={() => navigate(dashboardRoute)} style={{ display: 'flex', alignItems: 'center', gap: '6px', padding: '6px 12px', background: darkMode ? '#273449' : '#F3F4F6', border: BL, borderRadius: '8px', cursor: 'pointer', color: DK.subtext, fontSize: '13px', fontWeight: 600, fontFamily: 'inherit' }}
            onMouseEnter={e => e.currentTarget.style.background = darkMode ? '#334155' : '#E5E7EB'}
            onMouseLeave={e => e.currentTarget.style.background = darkMode ? '#273449' : '#F3F4F6'}
          >
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18"/></svg>
            Kembali
          </button>
          <div style={{ width: '1px', height: '20px', background: darkMode ? '#334155' : '#E5E7EB' }} />
          <img src={logoDark} alt="LaporKu" style={{ height: '40px', width: 'auto' }} />
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg,#2563EB,#7C3AED)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '11px', fontWeight: 800, color: '#fff', overflow: 'hidden', border: '2px solid #E5E7EB' }}>
            {user?.fotoProfil
              ? <img src={user.fotoProfil} alt="profil" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              : initials}
          </div>
          <div>
            <p style={{ fontSize: '12px', fontWeight: 700, color: DK.text, margin: 0, lineHeight: 1.2 }}>{user?.nama}</p>
            <p style={{ fontSize: '10px', color: DK.dimtext, margin: 0, textTransform: 'capitalize' }}>{user?.role}</p>
          </div>
        </div>
      </header>

      {/* Main layout */}
      <div style={{ maxWidth: '960px', margin: '0 auto', padding: '32px 24px', display: 'grid', gridTemplateColumns: '1fr 2fr', gap: '24px', alignItems: 'start' }}>

        {/* Left: Profile Card + Nav */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', position: 'sticky', top: '80px' }}>

          {/* Avatar card */}
          <div style={{ background: DK.surface, border: B, borderRadius: '14px', overflow: 'hidden', boxShadow: DK.cardShadow }}>
            <div style={{ background: 'linear-gradient(135deg,#2563EB,#7C3AED)', height: '72px', position: 'relative' }} />
            <div style={{ padding: '0 20px 20px', marginTop: '-36px' }}>
              <div style={{ position: 'relative', display: 'inline-block', marginBottom: '12px' }}>
                <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: 'linear-gradient(135deg,#2563EB,#7C3AED)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '22px', fontWeight: 800, color: '#fff', overflow: 'hidden', border: '3px solid #fff', boxShadow: '0 4px 16px rgba(37,99,235,0.3)' }}>
                  {user?.fotoProfil
                    ? <img src={user.fotoProfil} alt="profil" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    : initials}
                </div>
                <button onClick={() => fileRef.current.click()} disabled={loadingFoto} style={{ position: 'absolute', bottom: 0, right: 0, width: '24px', height: '24px', borderRadius: '50%', background: '#2563EB', border: '2px solid #fff', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#fff' }}>
                  <svg width="10" height="10" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}><path strokeLinecap="round" strokeLinejoin="round" d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"/></svg>
                </button>
              </div>
              <input ref={fileRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleUploadFoto} />
              <p style={{ fontSize: '15px', fontWeight: 800, color: DK.text, margin: '0 0 2px' }}>{user?.nama || '—'}</p>
              <p style={{ fontSize: '12px', color: DK.dimtext, margin: '0 0 12px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{user?.email}</p>
              <div style={{ display: 'flex', gap: '6px' }}>
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#2563EB', background: '#EFF6FF', padding: '3px 10px', borderRadius: '20px', border: '1.5px solid #BFDBFE', textTransform: 'capitalize' }}>{user?.role}</span>
                <span style={{ fontSize: '11px', fontWeight: 700, color: '#059669', background: '#ECFDF5', padding: '3px 10px', borderRadius: '20px', border: '1.5px solid #A7F3D0' }}>Aktif</span>
              </div>
            </div>
          </div>

          {/* Nav tabs */}
          <div style={{ background: DK.surface, border: B, borderRadius: '12px', overflow: 'hidden', boxShadow: DK.cardShadow }}>
            <div style={{ padding: '10px 12px', borderBottom: BL }}>
              <p style={{ fontSize: '10px', fontWeight: 700, color: DK.dimtext, letterSpacing: '1px', textTransform: 'uppercase', margin: 0 }}>Pengaturan</p>
            </div>
            {TABS.map(tab => (
              <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{
                display: 'flex', alignItems: 'center', gap: '10px', width: '100%',
                padding: '12px 16px', border: 'none', background: activeTab === tab.id ? (darkMode ? 'rgba(37,99,235,0.15)' : '#EFF6FF') : 'transparent',
                borderLeft: `3px solid ${activeTab === tab.id ? '#2563EB' : 'transparent'}`,
                cursor: 'pointer', fontSize: '13px', fontWeight: activeTab === tab.id ? 700 : 500,
                color: activeTab === tab.id ? '#3B82F6' : DK.subtext,
                fontFamily: 'inherit', textAlign: 'left', transition: 'all .15s',
              }}
                onMouseEnter={e => { if (activeTab !== tab.id) e.currentTarget.style.background = darkMode ? '#273449' : '#F9FAFB'; }}
                onMouseLeave={e => { if (activeTab !== tab.id) e.currentTarget.style.background = 'transparent'; }}
              >
                <span style={{ opacity: activeTab === tab.id ? 1 : 0.6 }}>{tab.icon}</span>
                {tab.label}
              </button>
            ))}

            <div style={{ borderTop: BL, padding: '8px' }}>
              <button onClick={logout} style={{
                display: 'flex', alignItems: 'center', gap: '10px', width: '100%',
                padding: '10px 12px', border: 'none', background: 'transparent',
                borderRadius: '8px', cursor: 'pointer', fontSize: '13px',
                fontWeight: 500, color: '#EF4444', fontFamily: 'inherit', textAlign: 'left',
              }}
                onMouseEnter={e => e.currentTarget.style.background = darkMode ? 'rgba(239,68,68,0.12)' : '#FEF2F2'}
                onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
              >
                <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}><path strokeLinecap="round" strokeLinejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/></svg>
                Logout
              </button>
            </div>
          </div>
        </div>

        {/* Right: Form content */}
        <div style={{ background: DK.surface, border: B, borderRadius: '14px', overflow: 'hidden', boxShadow: DK.cardShadow }}>

          {/* Form header */}
          <div style={{ padding: '20px 28px', borderBottom: B, background: DK.surfaceHover }}>
            <p style={{ fontSize: '15px', fontWeight: 800, color: DK.text, margin: '0 0 2px' }}>
              {activeTab === 'profil' ? 'Data Profil' : 'Keamanan Akun'}
            </p>
            <p style={{ fontSize: '12px', color: DK.dimtext, margin: 0 }}>
              {activeTab === 'profil' ? 'Perbarui informasi pribadi Anda' : 'Kelola password dan keamanan akun'}
            </p>
          </div>

          <div style={{ padding: '28px' }}>



            {/* Tab: Data Profil */}
            {activeTab === 'profil' && (
              <form onSubmit={handleUpdateProfil}>
                <div style={{ display: 'grid', gap: '20px' }}>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div>
                      <label style={{ fontSize: '12px', fontWeight: 600, color: DK.subtext, display: 'block', marginBottom: '6px' }}>Nama Lengkap</label>
                      <input
                        type="text"
                        value={form.nama}
                        onChange={e => { const v = e.target.value; setForm(f => ({ ...f, nama: v })); }}
                        placeholder="Masukkan nama lengkap"
                        style={{ width: '100%', padding: '10px 12px', border: `2px solid ${darkMode ? '#475569' : '#E5E7EB'}`, borderRadius: '9px', fontSize: '13px', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box', transition: 'border-color .15s', background: DK.inputBg, color: DK.text }}
                        onFocus={e => e.target.style.borderColor = '#2563EB'}
                        onBlur={e => e.target.style.borderColor = darkMode ? '#475569' : '#E5E7EB'}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '12px', fontWeight: 600, color: DK.subtext, display: 'block', marginBottom: '6px' }}>No. Telepon</label>
                      <input
                        type="text"
                        value={form.phone}
                        onChange={e => { const v = e.target.value; setForm(f => ({ ...f, phone: v })); }}
                        placeholder="08xxxxxxxxxx"
                        style={{ width: '100%', padding: '10px 12px', border: `2px solid ${darkMode ? '#475569' : '#E5E7EB'}`, borderRadius: '9px', fontSize: '13px', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box', transition: 'border-color .15s', background: DK.inputBg, color: DK.text }}
                        onFocus={e => e.target.style.borderColor = '#2563EB'}
                        onBlur={e => e.target.style.borderColor = darkMode ? '#475569' : '#E5E7EB'}
                      />
                      <p style={{ fontSize: '11px', color: DK.dimtext, margin: '5px 0 0' }}>Nomor yang dapat dihubungi</p>
                    </div>
                  </div>

                  <div style={{ height: '1px', background: darkMode ? '#334155' : '#F3F4F6' }} />

                  <p style={{ fontSize: '11px', fontWeight: 700, color: DK.dimtext, letterSpacing: '1px', textTransform: 'uppercase', margin: 0 }}>Informasi Akun</p>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <Input label="Email" value={user?.email || ''} disabled hint="Email tidak dapat diubah" />
                    <Input label="Username" value={user?.username || ''} disabled hint="Username tidak dapat diubah" />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
                    <div>
                      <label style={{ fontSize: '12px', fontWeight: 600, color: DK.dimtext, display: 'block', marginBottom: '6px' }}>Role</label>
                      <div style={{ padding: '10px 12px', border: `2px solid ${darkMode ? '#334155' : '#F3F4F6'}`, borderRadius: '9px', background: darkMode ? '#0F172A' : '#F9FAFB' }}>
                        <span style={{ fontSize: '12px', fontWeight: 700, color: '#2563EB', background: darkMode ? 'rgba(37,99,235,0.15)' : '#EFF6FF', padding: '3px 12px', borderRadius: '20px', border: '1.5px solid #BFDBFE', textTransform: 'capitalize' }}>{user?.role}</span>
                      </div>
                    </div>
                    <div>
                      <label style={{ fontSize: '12px', fontWeight: 600, color: DK.dimtext, display: 'block', marginBottom: '6px' }}>Status</label>
                      <div style={{ padding: '10px 12px', border: `2px solid ${darkMode ? '#334155' : '#F3F4F6'}`, borderRadius: '9px', background: darkMode ? '#0F172A' : '#F9FAFB' }}>
                        <span style={{ fontSize: '12px', fontWeight: 700, color: '#059669', background: darkMode ? 'rgba(5,150,105,0.15)' : '#ECFDF5', padding: '3px 12px', borderRadius: '20px', border: '1.5px solid #A7F3D0' }}>Aktif</span>
                      </div>
                    </div>
                  </div>

                  <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '8px', borderTop: `1.5px solid ${darkMode ? '#334155' : '#F3F4F6'}` }}>
                    <button type="submit" disabled={loading} style={{
                      display: 'flex', alignItems: 'center', gap: '8px',
                      padding: '11px 28px', background: loading ? '#93C5FD' : '#2563EB',
                      color: '#fff', border: 'none', borderRadius: '10px',
                      fontSize: '13px', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
                      fontFamily: 'inherit', transition: 'background .15s',
                    }}
                      onMouseEnter={e => { if (!loading) e.currentTarget.style.background = '#1D4ED8'; }}
                      onMouseLeave={e => { if (!loading) e.currentTarget.style.background = '#2563EB'; }}
                    >
                      {loading
                        ? 'Menyimpan...'
                        : <><svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7"/></svg>Simpan Perubahan</>}
                    </button>
                  </div>
                </div>
              </form>
            )}

            {/* Tab: Keamanan */}
            {activeTab === 'password' && (
              <form onSubmit={handleUpdatePassword}>
                <div style={{ display: 'grid', gap: '20px' }}>

                  <div style={{ padding: '14px 16px', background: darkMode ? 'rgba(146,64,14,0.15)' : '#FFFBEB', borderRadius: '10px', border: darkMode ? '1.5px solid #78350f' : '1.5px solid #FDE68A', display: 'flex', gap: '12px' }}>
                    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#D97706" strokeWidth={2} style={{ flexShrink: 0, marginTop: '1px' }}><path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/></svg>
                    <p style={{ fontSize: '12px', color: '#92400E', margin: 0, lineHeight: 1.6 }}>
                      Setelah password diperbarui, semua sesi aktif akan diakhiri dan Anda perlu login ulang menggunakan password baru.
                    </p>
                  </div>

                  <Input
                    label="Password Saat Ini"
                    type={showPass.lama ? 'text' : 'password'}
                    value={passForm.password_lama}
                    onChange={e => { const v = e.target.value; setPassForm(p => ({ ...p, password_lama: v })); }}
                    placeholder="Masukkan password saat ini"
                    rightEl={<EyeBtn show={showPass.lama} toggle={() => setShowPass(p => ({ ...p, lama: !p.lama }))} />}
                    darkMode={darkMode} DK={DK}
                  />

                  <div style={{ height: '1px', background: darkMode ? '#334155' : '#F3F4F6' }} />

                  <Input
                    label="Password Baru"
                    type={showPass.baru ? 'text' : 'password'}
                    value={passForm.password_baru}
                    onChange={e => { const v = e.target.value; setPassForm(p => ({ ...p, password_baru: v })); }}
                    placeholder="Minimal 8 karakter"
                    rightEl={<EyeBtn show={showPass.baru} toggle={() => setShowPass(p => ({ ...p, baru: !p.baru }))} />}
                    darkMode={darkMode} DK={DK}
                  />

                  {/* Strength indicator */}
                  {passForm.password_baru && (
                    <div style={{ marginTop: '-12px' }}>
                      <div style={{ display: 'flex', gap: '4px', marginBottom: '6px' }}>
                        {[1,2,3,4].map(i => (
                          <div key={i} style={{ flex: 1, height: '4px', borderRadius: '2px', background: i <= strength ? strengthColors[strength] : '#E5E7EB', transition: 'background .2s' }} />
                        ))}
                      </div>
                      <p style={{ fontSize: '11px', color: strengthColors[strength], fontWeight: 600, margin: 0 }}>
                        {strength > 0 && `Kekuatan password: ${strengthLabels[strength]}`}
                      </p>
                    </div>
                  )}

                  <Input
                    label="Konfirmasi Password Baru"
                    type={showPass.konfirmasi ? 'text' : 'password'}
                    value={passForm.konfirmasi_password}
                    onChange={e => { const v = e.target.value; setPassForm(p => ({ ...p, konfirmasi_password: v })); }}
                    placeholder="Ulangi password baru"
                    rightEl={<EyeBtn show={showPass.konfirmasi} toggle={() => setShowPass(p => ({ ...p, konfirmasi: !p.konfirmasi }))} />}
                    hint={passForm.konfirmasi_password && passForm.password_baru !== passForm.konfirmasi_password ? '⚠ Password tidak sama' : passForm.konfirmasi_password && passForm.password_baru === passForm.konfirmasi_password ? '✓ Password cocok' : ''}
                    darkMode={darkMode} DK={DK}
                  />

                  <div style={{ display: 'flex', justifyContent: 'flex-end', paddingTop: '8px', borderTop: `1.5px solid ${darkMode ? '#334155' : '#F3F4F6'}` }}>
                    <button type="submit" disabled={loading} style={{
                      display: 'flex', alignItems: 'center', gap: '8px',
                      padding: '11px 28px', background: loading ? '#6EE7B7' : '#059669',
                      color: '#fff', border: 'none', borderRadius: '10px',
                      fontSize: '13px', fontWeight: 700, cursor: loading ? 'not-allowed' : 'pointer',
                      fontFamily: 'inherit', transition: 'background .15s',
                    }}
                      onMouseEnter={e => { if (!loading) e.currentTarget.style.background = '#047857'; }}
                      onMouseLeave={e => { if (!loading) e.currentTarget.style.background = '#059669'; }}
                    >
                      {loading
                        ? 'Memperbarui...'
                        : <><svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>Perbarui Password</>}
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}