import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useForgotPassword, useVerifyForgotOtp } from '../hooks/useAuthForms';
import logoDark from '../assets/logo-darkmode.png';
import leftCardSby from '../assets/left-card-sby.png';
import './Auth.css';

export default function PasswordRecoveryPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [otp, setOtp] = useState('');
  const [step, setStep] = useState('email'); // 'email' | 'otp'

  const { loading: loadingEmail, error: errorEmail, sessionId, emailMasked, submit: submitEmail } = useForgotPassword();
  const { loading: loadingOtp, error: errorOtp, submit: submitOtp } = useVerifyForgotOtp();

  const handleSubmitEmail = async (e) => {
    e.preventDefault();
    await submitEmail(email);
    // Kalau sessionId terisi, pindah ke step OTP
    setStep('otp');
  };

  const handleSubmitOtp = (e) => {
    e.preventDefault();
    submitOtp({ sessionId, otpCode: otp });
  };

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
            <span className="auth-left-badge">
              {step === 'email' ? 'Lupa Password' : 'Verifikasi OTP'}
            </span>
            <h2>
              {step === 'email'
                ? 'Pulihkan akses ke akun LaporKu Anda.'
                : 'Masukkan kode OTP yang dikirim ke email Anda.'}
            </h2>
            <p className="auth-left-desc">
              {step === 'email'
                ? 'Masukkan email terdaftar dan kami kirimkan kode OTP.'
                : 'Kode OTP berlaku 5 menit. Segera masukkan sebelum kedaluwarsa.'}
            </p>
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

            {/* ── Step 1: Email ── */}
            {step === 'email' && (
              <>
                <span className="auth-tag">Lupa Password</span>
                <h1 className="auth-title">Reset Password</h1>
                <p className="auth-subtitle">Masukkan email Anda dan kami akan mengirimkan kode OTP.</p>

                {errorEmail && <div className="auth-error">{errorEmail}</div>}

                <form onSubmit={handleSubmitEmail} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div className="auth-group">
                    <label className="auth-label">Alamat Email</label>
                    <div className="auth-input-wrap">
                      <span className="auth-input-icon-left">
                        <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                        </svg>
                      </span>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        className="auth-input has-icon"
                        placeholder="Masukkan email terdaftar"
                      />
                    </div>
                    <p style={{ fontSize: '12px', color: '#94A3B8', marginTop: '6px' }}>
                      Kami akan mengirim kode OTP ke email ini.
                    </p>
                  </div>

                  <button type="submit" disabled={loadingEmail} className="auth-btn auth-btn-blue">
                    <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                    {loadingEmail ? 'Mengirim...' : 'Kirim Kode OTP'}
                  </button>

                  <p className="auth-footer-text">
                    Ingat password Anda?{' '}
                    <Link to="/login" className="auth-link auth-link-orange">Kembali login</Link>
                  </p>
                </form>
              </>
            )}

            {/* ── Step 2: OTP ── */}
            {step === 'otp' && (
              <>
                <span className="auth-tag">Verifikasi OTP</span>
                <h1 className="auth-title">Masukkan Kode OTP</h1>
                <p className="auth-subtitle">
                  Kode dikirim ke <strong style={{ color: '#374151' }}>{emailMasked}</strong>. Berlaku 5 menit.
                </p>

                {errorOtp && <div className="auth-error">{errorOtp}</div>}

                <form onSubmit={handleSubmitOtp} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                  <div className="auth-group">
                    <label className="auth-label">Kode OTP</label>
                    <input
                      type="text"
                      required
                      maxLength={6}
                      value={otp}
                      onChange={e => setOtp(e.target.value.replace(/\D/g, ''))}
                      className="auth-otp-input"
                      placeholder="000000"
                    />
                    <p style={{ fontSize: '12px', color: '#94A3B8', marginTop: '8px', textAlign: 'center' }}>
                      Masukkan 6 digit kode yang dikirim ke email Anda
                    </p>
                  </div>

                  <button
                    type="submit"
                    disabled={loadingOtp || otp.length !== 6}
                    className="auth-btn auth-btn-green"
                  >
                    {loadingOtp ? 'Memverifikasi...' : (
                      <>
                        Verifikasi OTP
                        <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                          <path strokeLinecap="round" strokeLinejoin="round" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                        </svg>
                      </>
                    )}
                  </button>

                  <button
                    type="button"
                    onClick={() => { setStep('email'); setOtp(''); }}
                    style={{
                      background: 'none', border: 'none', cursor: 'pointer',
                      fontSize: '13px', color: '#94A3B8', textAlign: 'center',
                    }}
                  >
                    ← Ganti email / kirim ulang OTP
                  </button>
                </form>
              </>
            )}

          </div>
        </div>
      </div>
    </div>
  );
}