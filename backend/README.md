# LaporKu — Backend

REST API untuk aplikasi pelaporan masyarakat. Dibangun dengan **Express.js**, **Prisma ORM**, **PostgreSQL**, dan **Redis**.

## Teknologi

- **Express.js 5** — framework HTTP
- **Prisma** — ORM & database migration
- **PostgreSQL 16** — database utama (via Docker)
- **Redis 7** — session/caching (via Docker)
- **JWT** — autentikasi access token + cookie refresh token
- **Multer** — upload foto laporan & profil
- **Nodemailer** — kirim email OTP lupa password

## Struktur Folder

```
backend/
├── src/
│   ├── app.js                  → Setup Express (CORS, middleware, routes)
│   ├── server.js               → Entry point (start server)
│   ├── config/
│   │   ├── env.js              → Baca dan validasi .env
│   │   └── redis.js            → Koneksi Redis
│   ├── controllers/            → Handler request HTTP
│   ├── services/               → Logika bisnis
│   ├── repositories/           → Query database (Prisma)
│   ├── routes/                 → Definisi endpoint
│   ├── middleware/             → Auth guard, validasi input
│   ├── observers/              → NotifikasiObserver (pattern)
│   ├── factory/                → ResponseFactory (pattern)
│   ├── lib/
│   │   └── prisma.js           → Singleton Prisma client
│   └── utils/                  → Helper (security, status)
├── prisma/
│   ├── schema.prisma           → Model database
│   └── migrations/             → Riwayat migrasi SQL
├── uploads/                    → File yang diupload (foto laporan/profil)
├── database/
│   └── schema.sql              → DDL referensi manual
├── docker-compose.yml          → PostgreSQL + Redis
├── .env                        → Variabel lingkungan (jangan di-commit!)
└── .env.example                → Template .env
```

## Menjalankan

```bash
# 1. Jalankan database
docker compose up -d

# 2. Install dependency
npm install

# 3. Salin dan isi .env
cp .env.example .env

# 4. Jalankan migrasi database
npx prisma migrate dev

# 5. Jalankan server development
npm run dev
```

Server berjalan di `http://localhost:3001`

## Scripts

| Perintah           | Keterangan                              |
|--------------------|-----------------------------------------|
| `npm run dev`      | Jalankan dengan nodemon (hot-reload)    |
| `npm start`        | Jalankan production                     |
| `npx prisma studio`| Buka GUI database Prisma                |
| `npx prisma migrate dev` | Jalankan migrasi baru            |
