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
                <Link to="/forgot-password" className="auth-forgot">Lupa kata sandi?</Link>
              </div>

              <button type="submit" disabled={loading} className="auth-btn auth-btn-green" style={{ marginTop: '4px' }}>
                {loading ? 'Memproses...' : (<>Masuk <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg></>)}
              </button>

              <p className="auth-footer-text">
                Belum punya akun?{' '}
                <Link to="/register" className="auth-link auth-link-orange">Daftar sekarang</Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}