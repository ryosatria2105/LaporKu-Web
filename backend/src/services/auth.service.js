import crypto from 'crypto';
import { prisma } from '../lib/prisma.js';
import {
  hashPassword, verifyPassword, hashToken, verifyToken,
  signAccessToken, generateOtpCode, hashOtpCode, verifyOtpCode,
} from '../utils/security.js';
import { sendResetPasswordOtpMail } from './mail.service.js';
import { redis } from '../config/redis.js';
import { env } from '../config/env.js';

function fail(status, message) {
  const err = new Error(message);
  err.status = status;
  throw err;
}

export async function registerUser({ nama, username, email, phone, password }) {
  const existing = await prisma.user.findFirst({
    where: { OR: [{ email }, { username }] }
  });
  if (existing) fail(409, 'Email atau username sudah digunakan');

  const passwordHash = await hashPassword(password);
  const user = await prisma.user.create({
    data: { nama, username, email, phone: phone || null, passwordHash, role: 'masyarakat' }
  });
  return { userId: user.id };
}

export async function loginUser({ loginInput, password, userAgent, ip }) {
  const user = await prisma.user.findFirst({
    where: { OR: [{ email: loginInput }, { username: loginInput }] }
  });
  if (!user) fail(401, 'Akun tidak ditemukan');
  if (!user.isActive) fail(403, 'Akun tidak aktif');

  const valid = await verifyPassword(password, user.passwordHash);
  if (!valid) fail(401, 'Password salah');

  const rawRefresh = crypto.randomBytes(64).toString('hex');
  const refreshHash = await hashToken(rawRefresh);
  const refreshExpires = new Date(Date.now() + env.JWT_REFRESH_EXPIRES_DAYS * 24 * 60 * 60 * 1000);

  await prisma.refreshToken.create({
    data: {
      userId: user.id,
      tokenHash: refreshHash,
      deviceInfo: userAgent || null,
      ipAddress: ip,
      expiresAt: refreshExpires,
    }
  });

  const accessToken = signAccessToken({ userId: user.id, role: user.role });
  const redirectTo = user.role === 'admin' ? '/dashboard/admin' : '/dashboard/user';

  return {
    accessToken,
    rawRefresh,
    user: { id: user.id, nama: user.nama, role: user.role },
    redirectTo,
  };
}

export async function logoutUser({ userId, rawRefresh }) {
  if (!rawRefresh) return;
  const tokens = await prisma.refreshToken.findMany({ where: { userId, revokedAt: null } });
  for (const t of tokens) {
    const match = await verifyToken(rawRefresh, t.tokenHash);
    if (match) {
      await prisma.refreshToken.update({ where: { id: t.id }, data: { revokedAt: new Date() } });
      break;
    }
  }
}

export async function forgotPassword({ email }) {
  const emailMasked = email.replace(/(.{2})(.*)(@.*)/, '$1***$3');
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user) return { emailMasked }; // silent fail, jangan reveal apakah email terdaftar

  const code = generateOtpCode();
  const codeHash = await hashOtpCode(code);
  const sessionId = crypto.randomBytes(16).toString('hex');

  // Simpan session → userId + OTP hash di Redis, expire 5 menit
  await redis.set(
    `otp:forgot:${sessionId}`,
    JSON.stringify({ userId: user.id, codeHash, attempts: 0 }),
    'EX', 5 * 60
  );

  await sendResetPasswordOtpMail(user.email, user.nama, code);
  console.log(`[DEV] OTP forgot password untuk ${user.email}: ${code}`);

  return { emailMasked, sessionId };
}

export async function verifyForgotOtp({ sessionId, otpCode }) {
  const raw = await redis.get(`otp:forgot:${sessionId}`);
  if (!raw) fail(401, 'OTP tidak valid atau sudah expired');

  const data = JSON.parse(raw);

  if (data.attempts >= 3) {
    await redis.del(`otp:forgot:${sessionId}`);
    fail(401, 'Terlalu banyak percobaan, silakan minta OTP baru');
  }

  const valid = await verifyOtpCode(otpCode, data.codeHash);
  if (!valid) {
    data.attempts++;
    await redis.set(`otp:forgot:${sessionId}`, JSON.stringify(data), 'KEEPTTL');
    fail(401, 'OTP salah');
  }

  // OTP valid — hapus dari Redis
  await redis.del(`otp:forgot:${sessionId}`);

  // Buat password reset token di DB
  await prisma.passwordReset.deleteMany({ where: { userId: data.userId } });

  const rawToken = crypto.randomBytes(32).toString('hex');
  const tokenHash = await hashToken(rawToken);
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000);

  await prisma.passwordReset.create({
    data: { userId: data.userId, tokenHash, expiresAt }
  });

  return { resetToken: rawToken };
}

export async function resetPassword({ token, newPassword }) {
  const resets = await prisma.passwordReset.findMany({
    where: { used: false, expiresAt: { gt: new Date() } }
  });

  let matched = null;
  for (const r of resets) {
    const ok = await verifyToken(token, r.tokenHash);
    if (ok) { matched = r; break; }
  }
  if (!matched) fail(401, 'Token tidak valid atau sudah expired');

  const passwordHash = await hashPassword(newPassword);
  await prisma.user.update({ where: { id: matched.userId }, data: { passwordHash } });
  await prisma.passwordReset.update({ where: { id: matched.id }, data: { used: true } });
  await prisma.refreshToken.updateMany({
    where: { userId: matched.userId, revokedAt: null },
    data: { revokedAt: new Date() }
  });
}