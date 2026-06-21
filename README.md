# LaporKu — Public Facility Reporting Platform

<p align="center">
  <strong>A full-stack web application for reporting and tracking public infrastructure issues in real time.</strong>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white" />
  <img src="https://img.shields.io/badge/Express.js-5-000000?logo=express&logoColor=white" />
  <img src="https://img.shields.io/badge/PostgreSQL-16-4169E1?logo=postgresql&logoColor=white" />
  <img src="https://img.shields.io/badge/Redis-7-DC382D?logo=redis&logoColor=white" />
  <img src="https://img.shields.io/badge/Prisma-ORM-2D3748?logo=prisma&logoColor=white" />
  <img src="https://img.shields.io/badge/License-MIT-green" />
</p>

---

## About

**LaporKu** is a public facility reporting platform that allows citizens to report local infrastructure issues — damaged roads, broken public amenities, security concerns, and more — while administrators verify, manage, and update report status in real time.

This project was built with an emphasis on **solid backend architecture**, **layered authentication security**, and **consistent design pattern usage** across the codebase, rather than a simple CRUD implementation.

> A companion **mobile application** (React Native + Expo) shares the same backend API.

---

## Key Features

- **Custom JWT authentication** — access + refresh tokens, implemented from scratch without third-party auth libraries
- **JWT blacklist via Redis** — tokens are invalidated immediately on logout
- **Rate limiting** — brute-force protection on login attempts
- **Full report CRUD** — including photo uploads, geolocation, and categorization
- **Report status workflow** — pending → in progress → resolved/rejected, with strict transition validation
- **Automated notifications** — triggered on every status change
- **Analytics dashboard** — report statistics and daily visitor tracking
- **Cookie consent** — preferences stored with AES-GCM encryption
- **Dark/light mode** and **multi-language support** (ID/EN)
- **Profile and user management** — including role-based access control

---

## Architecture

This project follows a **3-tier architecture** with clear separation of concerns:

```
Client (React)  →  Middleware  →  Controller  →  Service  →  Repository  →  Database
                  (Auth/Validation)  (HTTP Layer)  (Business    (Data Access)  (PostgreSQL)
                                                     Logic)
```

### Design Patterns

| Pattern | Implementation | Purpose |
|---|---|---|
| **Repository Pattern** | `laporan.repository.js`, `kategori.repository.js`, `profil.repository.js` | Abstracts database access, decouples logic from Prisma |
| **Factory Method** | `ResponseFactory.js`, `LaporanFactory.js` | Standardizes API responses and report object creation |
| **Observer Pattern** | `NotifikasiObserver.js` | Event-driven notifications without tight coupling between features |
| **State Pattern** | `LaporanStatePattern.js` | Enforces valid report status transitions |
| **Strategy Pattern** | `AuthStrategy.js`, `PeriodeStrategy.js` | Flexible validation and analytics period filtering |

---

## Tech Stack

**Backend**
- Node.js + Express.js 5
- Prisma ORM v7 + PostgreSQL 16
- Redis 7 (token blacklist, rate limiting, pub/sub)
- JWT + bcrypt (custom authentication)
- Multer (file uploads)
- Nodemailer (OTP email delivery)

**Frontend**
- React 19 + Vite
- Axios (with automatic JWT interceptor)
- Recharts (analytics visualization)

**Infrastructure**
- Docker & Docker Compose
- Nginx (reverse proxy)

---

## Getting Started

### Prerequisites
- Node.js ≥ 18
- Docker Desktop
- Git

### 1. Clone the Repository
```bash
git clone https://github.com/ryosatria2105/LaporKu-Web.git
cd LaporKu-Web
```

### 2. Start the Database
```bash
docker compose up -d
```

### 3. Backend Setup
```bash
cd backend
cp .env.example .env
# update .env with your local configuration
npm install
npx prisma migrate dev
npm run dev
```
Backend runs at `http://localhost:3001`

### 4. Frontend Setup
```bash
cd web
npm install
npm run dev
```
Frontend runs at `http://localhost:5173`

---

## Project Structure

```
LaporKu-Web/
├── backend/
│   └── src/
│       ├── controllers/     # HTTP request handlers
│       ├── services/        # Business logic
│       ├── repositories/    # Data access layer
│       ├── middleware/      # Auth, validation, rate limiting
│       ├── factory/         # Factory pattern implementations
│       ├── observers/       # Observer pattern (notifications)
│       ├── states/          # State pattern (report status)
│       └── routes/          # API endpoints
├── web/
│   └── src/
│       ├── pages/           # Role-based main pages
│       ├── components/      # Reusable components
│       ├── factory/         # Factory pattern (frontend)
│       ├── patterns/        # Strategy pattern (frontend)
│       ├── context/         # Global state management
│       ├── hooks/           # Custom React hooks
│       └── services/        # API service layer
└── docker-compose.yml
```

---

## Security

- Passwords hashed with **bcrypt** (10 salt rounds)
- Access token (15 min) + refresh token (7 days, httpOnly cookie)
- Logged-out tokens are added to a **Redis blacklist**
- Rate limiting on failed login attempts
- Input validation on every endpoint
- Role-based authorization (admin vs. regular user)

---

## Note

This project originated as part of a group assignment for a Mobile Web Programming course. The version maintained in this repository is an **independent development effort** kept for portfolio purposes, focused on the modules I personally built: authentication, profile management, category management, user management, system settings, and analytics.

---

## Contact

**Ryo Satriagung Hidayat**
Information Systems Student — UIN Sunan Ampel Surabaya

[GitHub](https://github.com/ryosatria2105)
