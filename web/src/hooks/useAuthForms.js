// =============================================================
// STRATEGY PATTERN — refactoring.guru
// -------------------------------------------------------------
// useAuthForms adalah React hook layer di atas AuthStrategy.
// Setiap hook (useLogin, useRegister, dst) memilih strategy
// yang tepat via AuthStrategyFactory — tanpa halaman Login,
// Register, dll perlu tahu detail endpoint atau implementasi.
// =============================================================

import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { AuthStrategyFactory } from '../patterns/AuthStrategy';

// ─────────────────────────────────────────────────────────────
// Autentikasi — Login
// ─────────────────────────────────────────────────────────────
export function useLogin() {
  const navigate = useNavigate();
  const { refreshUser } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  const submit = async (form) => {
    setError(''); setLoading(true);
    try {
      // Strategy Pattern: pilih LoginStrategy via factory
      const strategy = AuthStrategyFactory.create('login');
      const res = await strategy.execute({ login: form.login, password: form.password });
      const { redirectTo } = res.data;
      await refreshUser();
      navigate(redirectTo);
    } catch (err) {
      setError(err.response?.data?.message || 'Login gagal');
    } finally { setLoading(false); }
  };

  return { loading, error, submit };
}

// ─────────────────────────────────────────────────────────────
// Autentikasi — Register
// ─────────────────────────────────────────────────────────────
export function useRegister() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  const submit = async (form) => {
    setError('');
    if (form.password !== form.confirmPassword) return setError('Password tidak sama');
    if (form.password.length < 8) return setError('Password minimal 8 karakter');
    setLoading(true);
    try {
      // Strategy Pattern: pilih RegisterStrategy via factory
      const strategy = AuthStrategyFactory.create('register');
      await strategy.execute({
        nama: form.nama, username: form.username,
        email: form.email, phone: form.phone, password: form.password,
      });
      navigate('/login');
    } catch (err) {
      setError(err.response?.data?.message || 'Registrasi gagal');
    } finally { setLoading(false); }
  };

  return { loading, error, submit };
}

// ─────────────────────────────────────────────────────────────
// Autentikasi — Forgot Password
// ─────────────────────────────────────────────────────────────
export function useForgotPassword() {
  const [loading, setLoading]         = useState(false);
  const [error, setError]             = useState('');
  const [sessionId, setSessionId]     = useState('');
  const [emailMasked, setEmailMasked] = useState('');

  const submit = async (email) => {
    setLoading(true); setError('');
    try {
      // Strategy Pattern: pilih ForgotPasswordStrategy via factory
      const strategy = AuthStrategyFactory.create('forgot');
      const res = await strategy.execute({ email });
      setEmailMasked(res.data.emailMasked);
      setSessionId(res.data.sessionId || '');
    } catch {
      setError('Terjadi kesalahan, coba lagi.');
    } finally { setLoading(false); }
  };

  return { loading, error, sessionId, emailMasked, submit };
}

// ─────────────────────────────────────────────────────────────
// Autentikasi — Verify OTP (forgot password)
// ─────────────────────────────────────────────────────────────
export function useVerifyForgotOtp() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  const submit = async ({ sessionId, otpCode }) => {
    setLoading(true); setError('');
    try {
      // Strategy Pattern: pilih OTPStrategy via factory
      const strategy = AuthStrategyFactory.create('otp');
      const res = await strategy.execute({
        session_id: sessionId,
        otp_code: otpCode,
      });
      const { resetToken } = res.data;
      navigate(`/reset-password?token=${resetToken}`);
    } catch (err) {
      setError(err.response?.data?.message || 'OTP salah atau sudah expired');
    } finally { setLoading(false); }
  };

  return { loading, error, submit };
}

// ─────────────────────────────────────────────────────────────
// Autentikasi — Reset Password
// ─────────────────────────────────────────────────────────────
export function useResetPassword() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');
  const [success, setSuccess] = useState(false);

  const submit = async ({ token, form }) => {
    setError('');
    if (form.new_password !== form.confirm_password) return setError('Password tidak sama');
    if (form.new_password.length < 8) return setError('Password minimal 8 karakter');
    setLoading(true);
    try {
      // Strategy Pattern: pilih ResetPasswordStrategy via factory
      const strategy = AuthStrategyFactory.create('reset');
      await strategy.execute({ token, ...form });
      setSuccess(true);
    } catch (err) {
      setError(err.response?.data?.message || 'Gagal reset password, token mungkin kadaluarsa.');
    } finally { setLoading(false); }
  };

  return { loading, error, success, submit };
}