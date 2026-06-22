import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useLogin } from '../hooks/useAuthForms';
import logoDark from '../assets/logo-darkmode.png';
import leftCardSby from '../assets/left-card-sby.png';
import './Auth.css';

export default function LoginPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({ login: '', password: '' });
  const [showPass, setShowPass] = useState(false);

  const { loading, error, submit } = useLogin();

  const handleSubmit = (e) => {
    e.preventDefault();
    submit(form);
  };

  return (
    <div className="auth-page">
      <button onClick={() => navigate('/')} className="auth-back" aria-label="Kembali">
        <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
        </svg>
      </button>

      <div className="auth-card">
        {/* LEFT */}
        <div className="auth-left" style={{ backgroundImage: `url(${leftCardSby})` }}>
          <div className="auth-left-logo">
            <img src={logoDark} alt="LaporKu" />
          </div>
          <div style={{ position: 'relative', zIndex: 1 }}>
            <span className="auth-left-badge">Login Sistem Pelaporan</span>
            <h2>Laporkan fasilitas umum dengan cepat dan transparan.</h2>
            <p className="auth-left-desc">Masuk untuk mengakses informasi laporan dan dashboard sesuai hak akses akun Anda.</p>
          </div>
          <div className="auth-left-footer">
            <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="#4ADE80" strokeWidth={2} style={{ flexShrink: 0 }}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
            <p>Data Anda aman sesuai kebijakan privasi kami.</p>
          </div>
        </div>

        {/* RIGHT */}
        <div className="auth-right">
          <div className="auth-form-wrap">
            <span className="auth-tag">Login</span>
            <h1 className="auth-title">Masuk ke Akun</h1>
            <p className="auth-subtitle">Masukkan kredensial Anda untuk mengakses dashboard.</p>

            {error && <div className="auth-error">{error}</div>}

            {/* Mode demo portfolio: panel info kredensial demo.
                Hanya tampil kalau VITE_DEMO_MODE='true'. Tidak mempengaruhi tampilan lokal sama sekali. */}
        {import.meta.env.VITE_DEMO_MODE === 'true' && (
  <div style={{ background:'#F8FAFC', border:'1px solid #E2E8F0', borderRadius:'12px', padding:'16px', marginBottom:'16px', fontSize:'13px' }}>
    <p style={{ fontWeight:700, color:'#0F172A', marginBottom:'12px', fontSize:'11px', letterSpacing:'0.08em', textTransform:'uppercase', margin:'0 0 12px' }}>Demo Environment</p>
    <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:'12px 20px' }}>
      <div>
        <p style={{ fontWeight:600, color:'#1E293B', margin:'0 0 8px' }}>Akun Demo</p>
        <p style={{ color:'#334155', margin:'0 0 2px' }}>1. Admin</p>
        <p style={{ color:'#64748B', margin:'0 0 2px', paddingLeft:'12px' }}>USN: <code style={{ background:'#E2E8F0', padding:'1px 5px', borderRadius:'4px' }}>admin_demo</code></p>
        <p style={{ color:'#64748B', margin:'0 0 10px', paddingLeft:'12px' }}>PWD: <code style={{ background:'#E2E8F0', padding:'1px 5px', borderRadius:'4px' }}>demo12345</code></p>
        <p style={{ color:'#334155', margin:'0 0 2px' }}>2. Masyarakat</p>
        <p style={{ color:'#64748B', margin:'0 0 2px', paddingLeft:'12px' }}>USN: <code style={{ background:'#E2E8F0', padding:'1px 5px', borderRadius:'4px' }}>warga_demo</code></p>
        <p style={{ color:'#64748B', margin:'0', paddingLeft:'12px' }}>PWD: <code style={{ background:'#E2E8F0', padding:'1px 5px', borderRadius:'4px' }}>demo12345</code></p>
      </div>
      <div>
        <p style={{ fontWeight:600, color:'#1E293B', margin:'0 0 8px' }}>Informasi</p>
        <p style={{ color:'#64748B', margin:'0 0 6px' }}>1. Respons pertama ~5–10 detik, normal pada environment serverless.</p>
        <p style={{ color:'#64748B', margin:'0 0 6px' }}>2. Tampilan optimal di laptop/PC (min. 1024px).</p>
        <p style={{ color:'#64748B', margin:'0 0 6px' }}>3. Upload foto dinonaktifkan — tidak ada persistent storage pada environment demo.</p>
        <p style={{ color:'#64748B', margin:'0 0 6px' }}>4. Registrasi dinonaktifkan — gunakan akun demo di kiri.</p>
        <p style={{ color:'#64748B', margin:'0' }}>5. Lupa kata sandi dinonaktifkan — akun demo tidak memerlukan reset password.</p>
      </div>
    </div>
  </div>
)}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
              <div className="auth-group">
                <label className="auth-label">Username atau Email</label>
                <div className="auth-input-wrap">
                  <span className="auth-input-icon-left">
                    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </span>
                  <input type="text" required value={form.login}
                    onChange={e => setForm({ ...form, login: e.target.value })}
                    className="auth-input has-icon"
                    placeholder="Username atau email" />
                </div>
              </div>

              <div className="auth-group">
                <label className="auth-label">Password</label>
                <div className="auth-input-wrap">
                  <span className="auth-input-icon-left">
                    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                  </span>
                  <input type={showPass ? 'text' : 'password'} required value={form.password}
                    onChange={e => setForm({ ...form, password: e.target.value })}
                    className="auth-input has-icon has-icon-r"
                    placeholder="Masukkan password" />
                  <button type="button" onClick={() => setShowPass(!showPass)} className="auth-input-icon-right">
                    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d={showPass
                        ? "M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"
                        : "M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"} />
                    </svg>
                  </button>
                </div>
              </div>

              <div style={{ textAlign: 'right', marginTop: '-6px' }}>
                {import.meta.env.VITE_DEMO_MODE === 'true' ? <span className="auth-forgot" style={{ color: '#9CA3AF', cursor: 'default' }}>Lupa kata sandi? (nonaktif)</span> : <Link to="/forgot-password" className="auth-forgot">Lupa kata sandi?</Link>}
              </div>

              <button type="submit" disabled={loading} className="auth-btn auth-btn-green" style={{ marginTop: '4px' }}>
                {loading ? 'Memproses...' : (<>Masuk <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg></>)}
              </button>

              {/* Mode demo portfolio: dua tombol quick-fill, hanya tampil kalau VITE_DEMO_MODE='true'.
                  Tidak mempengaruhi tampilan lokal sama sekali kalau env var tidak di-set. */}
              {import.meta.env.VITE_DEMO_MODE === 'true' && (
                <div style={{ display: 'flex', gap: '8px', marginTop: '8px' }}>
                  <button
                    type="button"
                    onClick={() => {
                      setForm({ login: 'admin_demo', password: 'demo12345' });
                    }}
                    className="auth-btn"
                    style={{ flex: 1, background: '#F1F5F9', color: '#1E293B', border: '1px solid #E2E8F0' }}
                  >
                    Coba sebagai Admin
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setForm({ login: 'warga_demo', password: 'demo12345' });
                    }}
                    className="auth-btn"
                    style={{ flex: 1, background: '#F1F5F9', color: '#1E293B', border: '1px solid #E2E8F0' }}
                  >
                    Coba sebagai Masyarakat
                  </button>
                </div>
              )}

              <p className="auth-footer-text">
                {import.meta.env.VITE_DEMO_MODE === 'true' ? (
                  'Registrasi dinonaktifkan pada mode demo.'
                ) : (
                  <>
                    Belum punya akun?{' '}
                    <Link to="/register" className="auth-link auth-link-orange">Daftar sekarang</Link>
                  </>
                )}
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
