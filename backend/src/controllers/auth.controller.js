import * as authService from '../services/auth.service.js';
import { redis } from '../config/redis.js';

const COOKIE_OPTS = {
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax',
};

function handleServiceError(err, res) {
  if (err.status) return res.status(err.status).json({ success: false, message: err.message });
  console.error('[SERVER ERROR]', err);
  return res.status(500).json({ success: false, message: 'Server error' });
}

export async function register(req, res) {
  try {
    const { nama, username, email, phone, password } = req.body;
    if (!nama || !username || !email || !password)
      return res.status(400).json({ success: false, message: 'Semua field wajib diisi' });
    if (password.length < 8)
      return res.status(400).json({ success: false, message: 'Password minimal 8 karakter' });

    const data = await authService.registerUser({ nama, username, email, phone, password });
    return res.status(201).json({ success: true, message: 'Registrasi berhasil, silakan login', data });
  } catch (err) { return handleServiceError(err, res); }
}

export async function login(req, res) {
  try {
    const { login: loginInput, password } = req.body;
    if (!loginInput || !password)
      return res.status(400).json({ success: false, message: 'Login dan password wajib diisi' });

    const result = await authService.loginUser({
      loginInput,
      password,
      userAgent: req.headers['user-agent'],
      ip: req.ip,
    });

    res.cookie('access_token', result.accessToken, { ...COOKIE_OPTS, maxAge: 15 * 60 * 1000 });
    res.cookie('refresh_token', result.rawRefresh, {
      ...COOKIE_OPTS,
      maxAge: 7 * 24 * 60 * 60 * 1000,
      path: '/api/v1/auth/refresh',
    });

    // tambah token di body supaya mobile bisa ambil
    return res.json({
      success: true,
      message: 'Login berhasil',
      token: result.accessToken,
      data: { user: result.user, redirectTo: result.redirectTo },
    });
  } catch (err) { return handleServiceError(err, res); }
}

export async function logout(req, res) {
  try {
    const accessToken = req.cookies?.access_token;
    if (accessToken) {
      await redis.set(`blacklist:${accessToken}`, '1', 'EX', 15 * 60).catch(() => {});
    }

    await authService.logoutUser({ userId: req.user.id, rawRefresh: req.cookies?.refresh_token });
    res.clearCookie('access_token');
    res.clearCookie('refresh_token', { path: '/api/v1/auth/refresh' });
    return res.json({ success: true, message: 'Logout berhasil' });
  } catch (err) { return handleServiceError(err, res); }
}

export async function getMe(req, res) {
  return res.json({ success: true, data: req.user });
}

export async function forgotPassword(req, res) {
  try {
    const { email } = req.body;
    if (!email) return res.status(400).json({ success: false, message: 'Email wajib diisi' });

    const data = await authService.forgotPassword({ email });
    return res.json({ success: true, message: 'Jika email terdaftar, kode OTP akan dikirimkan', data });
  } catch (err) { return handleServiceError(err, res); }
}

export async function verifyForgotOtp(req, res) {
  try {
    const { session_id, otp_code } = req.body;
    if (!session_id || !otp_code)
      return res.status(400).json({ success: false, message: 'Session dan OTP wajib diisi' });

    const data = await authService.verifyForgotOtp({
      sessionId: session_id,
      otpCode: otp_code,
    });
    return res.json({ success: true, message: 'OTP valid', data });
  } catch (err) { return handleServiceError(err, res); }
}

export async function resetPassword(req, res) {
  try {
    const { token, new_password, confirm_password } = req.body;
    if (!token || !new_password || !confirm_password)
      return res.status(400).json({ success: false, message: 'Semua field wajib diisi' });
    if (new_password !== confirm_password)
      return res.status(400).json({ success: false, message: 'Password tidak sama' });
    if (new_password.length < 8)
      return res.status(400).json({ success: false, message: 'Password minimal 8 karakter' });

    await authService.resetPassword({ token, newPassword: new_password });
    return res.json({ success: true, message: 'Password berhasil direset, silakan login' });
  } catch (err) { return handleServiceError(err, res); }
}