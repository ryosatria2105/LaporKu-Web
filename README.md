# LaporKu Web

Project web untuk platform pelaporan masyarakat — terdiri dari **Backend API** dan **Frontend Web (React)**.

```
laporku-web/
├── backend/    → REST API (Express + Prisma + PostgreSQL + Redis)
├── web/        → Dashboard Web (React + Vite + Tailwind CSS)
└── nginx.conf  → Konfigurasi reverse proxy production
```

> **LaporKu Mobile** ada di project terpisah (`laporku-mobile/`) yang berbagi backend API yang sama.

---

## Cara Menjalankan

### 1. Database (Docker)
```bash
cd backend
docker compose up -d
```
PostgreSQL jalan di port **5433**, Redis di port **6379**.

### 2. Backend
```bash
cd backend
cp .env.example .env   # isi variabel sesuai kebutuhan
npm install
npx prisma migrate dev
npm run dev            # http://localhost:3001
```

### 3. Web
```bash
cd web
npm install
npm run dev            # http://localhost:5173
```

Vite otomatis mem-proxy `/api/*` dan `/uploads/*` ke `localhost:3001`.

---

## Production (Nginx)
```bash
cd web && npm run build       # output ke web/dist/
# Salin dist/ ke /var/www/laporku/web/dist/
# Jalankan nginx dengan nginx.conf yang sudah disediakan
```
