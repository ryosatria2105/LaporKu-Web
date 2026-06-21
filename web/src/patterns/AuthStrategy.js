// =============================================================
// STRATEGY PATTERN — refactoring.guru
// -------------------------------------------------------------
// Memungkinkan pemilihan metode autentikasi secara dinamis
// tanpa mengubah LoginPage, RegisterPage, dll yang sudah ada.
//
// Struktur:
//   AuthStrategy (Abstract)
//     ├── LoginStrategy          → POST /auth/login
//     ├── RegisterStrategy       → POST /auth/register
//     ├── OTPStrategy            → POST /auth/verify-forgot-otp
//     ├── ForgotPasswordStrategy → POST /auth/forgot-password
//     └── ResetPasswordStrategy  → POST /auth/reset-password
//
//   AuthContext    → jalankan strategy yang dipilih
//   AuthStrategyFactory → buat strategy berdasarkan tipe string
// =============================================================

import api from '../utils/api.js';

// ─────────────────────────────────────────────────────────────
// Abstract Strategy
// ─────────────────────────────────────────────────────────────
class AuthStrategy {
  async execute(credentials) {
    throw new Error('execute() harus diimplementasikan');
  }
}

// ─────────────────────────────────────────────────────────────
// Concrete Strategies
// ─────────────────────────────────────────────────────────────
class LoginStrategy extends AuthStrategy {
  async execute({ login, password }) {
    return (await api.post('/auth/login', { login, password })).data;
  }
}

class RegisterStrategy extends AuthStrategy {
  async execute({ nama, username, email, phone, password }) {
    return (await api.post('/auth/register', { nama, username, email, phone, password })).data;
  }
}

class OTPStrategy extends AuthStrategy {
  async execute({ session_id, otp_code }) {
    return (await api.post('/auth/verify-forgot-otp', { session_id, otp_code })).data;
  }
}

class ForgotPasswordStrategy extends AuthStrategy {
  async execute({ email }) {
    return (await api.post('/auth/forgot-password', { email })).data;
  }
}

class ResetPasswordStrategy extends AuthStrategy {
  async execute(payload) {
    return (await api.post('/auth/reset-password', payload)).data;
  }
}

// ─────────────────────────────────────────────────────────────
// Context — dipakai untuk jalankan strategy yang dipilih
// ─────────────────────────────────────────────────────────────
class AuthContext {
  constructor(strategy) { this._strategy = strategy; }
  setStrategy(strategy) { this._strategy = strategy; }
  async authenticate(credentials) {
    return await this._strategy.execute(credentials);
  }
}

// ─────────────────────────────────────────────────────────────
// Factory — satu entry point untuk buat strategy berdasarkan tipe
// ─────────────────────────────────────────────────────────────
const AuthStrategyFactory = {
  create(type) {
    const map = {
      login:    new LoginStrategy(),
      register: new RegisterStrategy(),
      otp:      new OTPStrategy(),
      forgot:   new ForgotPasswordStrategy(),
      reset:    new ResetPasswordStrategy(),
    };
    if (!map[type]) throw new Error(`Strategy '${type}' tidak dikenal`);
    return map[type];
  },
};

export {
  AuthStrategy, LoginStrategy, RegisterStrategy,
  OTPStrategy, ForgotPasswordStrategy, ResetPasswordStrategy,
  AuthContext, AuthStrategyFactory,
};