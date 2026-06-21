import express from 'express';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
import cors from 'cors';
import cookieParser from 'cookie-parser';
import { env } from './config/env.js';
import routes from './routes/index.js';

export function createApp() {
  const app = express();

  if (env.NODE_ENV === 'production') {
    app.use((req, res, next) => {
      if (req.headers['x-forwarded-proto'] !== 'https') {
        return res.redirect(301, `https://${req.headers.host}${req.url}`);
      }
      next();
    });
  }

  app.use(cors({
    origin: (origin, callback) => {
      // Allow web (CLIENT_URL), mobile (no origin), dan tools seperti Postman
      if (!origin || origin === env.CLIENT_URL) {
        callback(null, true);
      } else {
        callback(null, true); // dev mode: allow all
      }
    },
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization'],
  }));

  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  app.use('/api/v1', routes);
  const uploadsPath = join(__dirname, '..', 'uploads');
  console.log('[STATIC] Serving uploads from:', uploadsPath);
  app.use('/uploads', express.static(uploadsPath));

  app.get('/api/v1/health', (req, res) => {
    res.json({
      success: true,
      status: 'ok',
      timestamp: new Date().toISOString(),
      env: env.NODE_ENV,
    });
  });

  app.use((req, res) => {
    res.status(404).json({ success: false, message: 'Endpoint tidak ditemukan' });
  });

  app.use((err, req, res, next) => {
    console.error('[ERROR]', err);
    res.status(err.status || 500).json({
      success: false,
      message: err.message || 'Server error',
    });
  });

  return app;
}