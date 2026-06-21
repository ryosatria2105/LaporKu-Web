import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useRegister } from '../hooks/useAuthForms';
import logoDark from '../assets/logo-darkmode.png';
import leftCardSby from '../assets/left-card-sby.png';
import './Auth.css';

export default function RegisterPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    nama: '', username: '', phone: '', email: '', password: '', confirmPassword: ''
  });

  const { loading, error, submit } = useRegister();

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
            <span className="auth-left-badge">Daftar Akun Baru</span>
            <h2>Mulai gunakan LaporKu dengan akun baru Anda.</h2>
            <p className="auth-left-desc">Lengkapi data pendaftaran, lalu lanjutkan ke dashboard setelah proses login berhasil.</p>
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
            <span className="auth-tag">Registrasi</span>
            <h1 className="auth-title">Buat Akun Baru</h1>
            <p className="auth-subtitle">Lengkapi data berikut untuk mendaftarkan akun Anda.</p>

            {error && <div className="auth-error">{error}</div>}

            <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              <div className="auth-group">
                <label className="auth-label">Nama Lengkap</label>
                <div className="auth-input-wrap">
                  <span className="auth-input-icon-left">
                    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                  </span>
                  <input type="text" required value={form.nama}
                    onChange={e => setForm({ ...form, nama: e.target.value })}
                    className="auth-input has-icon" placeholder="Nama lengkap" />
                </div>
              </div>

              <div className="auth-grid-2">
                <div className="auth-group">
                  <label className="auth-label">Username</label>
                  <input type="text" required value={form.username}
                    onChange={e => setForm({ ...form, username: e.target.value })}
                    className="auth-input" placeholder="Username" />
                </div>
                <div className="auth-group">
                  <label className="auth-label">No Telepon</label>
                  <input type="tel" value={form.phone}
                    onChange={e => setForm({ ...form, phone: e.target.value })}
                    className="auth-input" placeholder="08xxxxxxxxxx" />
                </div>
              </div>

              <div className="auth-group">
                <label className="auth-label">Email</label>
                <div className="auth-input-wrap">
                  <span className="auth-input-icon-left">
                    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                    </svg>
                  </span>
                  <input type="email" required value={form.email}
                    onChange={e => setForm({ ...form, email: e.target.value })}
                    className="auth-input has-icon" placeholder="Email" />
                </div>
              </div>

              <div className="auth-grid-2">
                <div className="auth-group">
                  <label className="auth-label">Password</label>
                  <input type="password" required value={form.password}
                    onChange={e => setForm({ ...form, password: e.target.value })}
                    className="auth-input" placeholder="Min 8 karakter" />
                </div>
                <div className="auth-group">
                  <label className="auth-label">Confirm Password</label>
                  <input type="password" required value={form.confirmPassword}
                    onChange={e => setForm({ ...form, confirmPassword: e.target.value })}
                    className="auth-input" placeholder="Ulangi password" />
                </div>
              </div>

              <button type="submit" disabled={loading} className="auth-btn auth-btn-green" style={{ marginTop: '4px' }}>
                {loading ? 'Mendaftar...' : (<>Daftar Sekarang <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}><path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" /></svg></>)}
              </button>

              <p className="auth-footer-text">
                Sudah punya akun?{' '}
                <Link to="/login" className="auth-link auth-link-orange">Masuk di sini</Link>
              </p>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}