import { verifyAccessToken } from '../utils/security.js';
import { prisma } from '../lib/prisma.js';
import { redis } from '../config/redis.js';

// ── Authenticate ─────────────────────────────────────────────
export async function authenticate(req, res, next) {
  try {
    // Support Authorization: Bearer <token> untuk mobile
    // fallback ke cookie untuk web
    let token = null;
    const authHeader = req.headers.authorization;
    if (authHeader?.startsWith('Bearer ')) {
      token = authHeader.split(' ')[1];
    } else {
      token = req.cookies?.access_token;
    }

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Akses ditolak, silakan login'
      });
    }

    const isBlacklisted = await redis.get(`blacklist:${token}`).catch(() => null);
    if (isBlacklisted) {
      return res.status(401).json({
        success: false,
        message: 'Sesi tidak valid, silakan login kembali'
      });
    }

    const payload = verifyAccessToken(token);

    const user = await prisma.user.findUnique({
      where: { id: payload.userId },
      select: {
        id: true,
        nama: true,
        username: true,
        email: true,
        phone: true,
        fotoProfil: true,
        role: true,
        isActive: true,
        createdAt: true,
      }
    });

    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Akun tidak ditemukan atau tidak aktif'
      });
    }

    req.user = user;
    next();
  } catch (err) {
    return res.status(401).json({
      success: false,
      message: 'Token tidak valid atau sudah expired'
    });
  }
}

// ── Role Guard ────────────────────────────────────────────────
export function requireRole(...roles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: 'Belum login'
      });
    }
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        message: 'Akses ditolak, role tidak sesuai'
      });
    }
    next();
  };
}

export const requireAdmin = (req, res, next) => {
  if (req.user?.role !== 'admin') {
    return res.status(403).json({ success: false, message: 'Akses ditolak' });
  }
  next();
};

// ── Rate Limiter ──────────────────────────────────────────────
const MAX_ATTEMPTS = 5;
const WINDOW_SEC = 15 * 60;

export async function loginRateLimiter(req, res, next) {
  const key = `ratelimit:login:${req.ip}`;
  try {
    const attempts = await redis.incr(key);
    if (attempts === 1) await redis.expire(key, WINDOW_SEC);

    if (attempts > MAX_ATTEMPTS) {
      const ttl = await redis.ttl(key);
      return res.status(429).json({
        success: false,
        message: `Terlalu banyak percobaan login. Coba lagi dalam ${Math.ceil(ttl / 60)} menit.`,
      });
    }
    next();
  } catch {
    next();
  }
}
