import Redis from 'ioredis';
import { env } from './env.js';

// Lokal/Docker: pakai host+port (REDIS_HOST/REDIS_PORT) — sama persis seperti sekarang.
// Railway/Render: kasih satu connection string lengkap via REDIS_URL — dipakai kalau ada.
export const redis = env.REDIS_URL
  ? new Redis(env.REDIS_URL, { lazyConnect: true })
  : new Redis({
      host: env.REDIS_HOST,
      port: env.REDIS_PORT,
      lazyConnect: true,
    });

redis.on('connect', () => console.log('✅ Redis connected'));
redis.on('error', (err) => console.error('[REDIS ERROR]', err));