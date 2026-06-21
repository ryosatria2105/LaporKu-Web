# LaporKu — Web

Dashboard web React untuk admin dan pengguna aplikasi pelaporan masyarakat.

## Teknologi

- **React 19** + **Vite 5** — UI framework + build tool
- **React Router DOM 6** — client-side routing
- **Tailwind CSS 4** — utility-first styling
- **Recharts** — grafik statistik dashboard admin
- **Axios** — HTTP client (proxy via Vite ke backend)
- **GSAP** — animasi landing page

## Struktur Folder

```
web/
├── src/
│   ├── App.jsx              → Routing utama (protected/guest routes)
│   ├── main.jsx             → Entry point React
│   ├── pages/
│   │   ├── LandingPage.jsx  → Halaman publik
│   │   ├── LoginPage.jsx    → Halaman login
│   │   ├── RegisterPage.jsx → Halaman daftar
│   │   ├── PasswordRecoveryPage.jsx → Lupa password
│   │   ├── ResetPasswordPage.jsx   → Reset password
│   │   ├── DashboardAdminPage.jsx  → Dashboard admin
│   │   ├── DashboardUserPage.jsx   → Dashboard pengguna
│   │   ├── LaporanAdminPage.jsx    → Kelola laporan (admin)
│   │   ├── KategoriPage.jsx        → Kelola kategori (admin)
│   │   └── ProfilPage.jsx          → Edit profil
│   ├── components/
│   │   ├── PrivateRoute.jsx        → Guard halaman butuh login
│   │   ├── CookieBanner.jsx        → Banner persetujuan cookie
│   │   └── laporan/                → Komponen terkait laporan
│   ├── context/
│   │   └── AuthContext.jsx         → State autentikasi global
│   ├── services/
│   │   └── api.service.js          → Facade semua endpoint API
│   ├── utils/
│   │   └── api.js                  → Axios instance + interceptors
│   ├── factory/
│   │   └── LaporanFactory.js       → Factory Pattern laporan
│   ├── patterns/
│   │   ├── AuthStrategy.js         → Strategy Pattern auth
│   │   └── PeriodeStrategy.js      → Strategy Pattern filter periode
│   └── hooks/
│       └── useAuthForms.js         → Hook form auth
├── public/
│   └── assets/             → Gambar publik
├── vite.config.js           → Konfigurasi Vite + proxy backend
└── .env.example             → Template variabel lingkungan
```

## Menjalankan

```bash
npm install
npm run dev   # buka http://localhost:5173
```

Pastikan backend sudah berjalan di port `3001` — Vite akan otomatis mem-proxy semua request `/api/*` dan `/uploads/*` ke backend.

## Build Production

```bash
npm run build   # output ke dist/
```

Salin folder `dist/` ke server dan arahkan Nginx ke direktori tersebut (lihat `nginx.conf` di root project).
