import { useState } from 'react';
import { useNavigate, Link, useSearchParams } from 'react-router-dom';
import { useResetPassword } from '../hooks/useAuthForms';
import logoDark from '../assets/logo-darkmode.png';
import leftCardSby from '../assets/left-card-sby.png';
import './Auth.css';

export default function ResetPasswordPage() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get('token');
  const [form, setForm] = useState({ new_password: '', confirm_password: '' });
  const [showPass, setShowPass] = useState({ new: false, confirm: false });

  const { loading, error, success, submit } = useResetPassword();

  const handleSubmit = (e) => {
    e.preventDefault();
    submit({ token, form });
  };

  if (!token) {
    return (
      <div className="auth-page">
        <div className="auth-card" style={{ maxWidth: '400px' }}>
          <div className="auth-right">
            <div className="auth-form-wrap" style={{ textAlign: 'center' }}>
              <h2 className="auth-title">Link Tidak Valid</h2>
              <p className="auth-subtitle">Token reset password tidak ditemukan.</p>
              <Link to="/forgot-password" className="auth-link">Minta link baru</Link>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page">
      <button onClick={() => navigate('/login')} className="auth-back" aria-label="Kembali">
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
            <span className="auth-left-badge">Reset Password</span>
            <h2>Buat password baru untuk akun LaporKu Anda.</h2>
            <p className="auth-left-desc">Pastikan password baru Anda kuat dan mudah diingat.</p>
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
            {success ? (
              <div style={{ textAlign: 'center', padding: '32px 0' }}>
                <div className="auth-success-icon">
                  <svg width="32" height="32" fill="none" viewBox="0 0 24 24" stroke="#16A34A" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <h2 className="auth-title" style={{ textAlign: 'center' }}>Password Berhasil Direset!</h2>
                <p className="auth-subtitle" style={{ textAlign: 'center', marginTop: '8px' }}>
                  Password Anda telah berhasil diperbarui. Silakan login dengan password baru.
                </p>
                <Link to="/login" className="auth-link" style={{ fontSize: '13px' }}>Login sekarang</Link>
              </div>
            ) : (
              <>
                <span className="auth-tag">Reset Password</span>
                <h1 className="auth-title">Buat Password Baru</h1>
                <p className="auth-subtitle">Masukkan password baru Anda di bawah ini.</p>

                {error && <div className="auth-error">{error}</div>}

                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div className="auth-group">
                    <label className="auth-label">Password Baru</label>
                    <div className="auth-input-wrap">
                      <input
                        type={showPass.new ? 'text' : 'password'}
                        required
                        value={form.new_password}
                        onChange={e => setForm({ ...form, new_password: e.target.value })}
                        className="auth-input"
                        placeholder="Minimal 8 karakter"
                      />
                      <button type="button" className="auth-input-icon-right" onClick={() => setShowPass(p => ({ ...p, new: !p.new }))}>
                        <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d={showPass.new ? "M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" : "M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"} />
                        </svg>
                      </button>
                    </div>
                  </div>

                  <div className="auth-group">
                    <label className="auth-label">Konfirmasi Password Baru</label>
                    <div className="auth-input-wrap">
                      <input
                        type={showPass.confirm ? 'text' : 'password'}
                        required
                        value={form.confirm_password}
                        onChange={e => setForm({ ...form, confirm_password: e.target.value })}
                        className="auth-input"
                        placeholder="Ulangi password baru"
                      />
                      <button type="button" className="auth-input-icon-right" onClick={() => setShowPass(p => ({ ...p, confirm: !p.confirm }))}>
                        <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d={showPass.confirm ? "M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" : "M15 12a3 3 0 11-6 0 3 3 0 016 0zM2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"} />
                        </svg>
                      </button>
                    </div>
                  </div>

                  <button type="submit" disabled={loading} className="auth-btn auth-btn-green">
                    {loading ? 'Memperbarui...' : 'Reset Password'}
                  </button>

                  <p className="auth-footer-text">
                    Ingat password Anda?{' '}
                    <Link to="/login" className="auth-link auth-link-orange">Kembali login</Link>
                  </p>
                </form>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}