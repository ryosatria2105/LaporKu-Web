import bcrypt from 'bcrypt';
import crypto from 'crypto';
import jwt from 'jsonwebtoken';
import { env } from '../config/env.js';

// ── Hashing ──────────────────────────────────────────────────
export async function hashPassword(password) {
  return bcrypt.hash(password, env.BCRYPT_COST);
}

export async function verifyPassword(password, hash) {
  return bcrypt.compare(password, hash);
}

export async function hashToken(token) {
  return bcrypt.hash(token, 10);
}

export async function verifyToken(token, hash) {
  return bcrypt.compare(token, hash);
}

// ── JWT ───────────────────────────────────────────────────────
export function signAccessToken(payload) {
  return jwt.sign(payload, env.JWT_ACCESS_SECRET, {
    expiresIn: env.JWT_ACCESS_EXPIRES,
  });
}

export function verifyAccessToken(token) {
  return jwt.verify(token, env.JWT_ACCESS_SECRET);
}

// ── OTP ───────────────────────────────────────────────────────
export function generateOtpCode() {
  return crypto.randomInt(100000, 999999).toString();
}

export async function hashOtpCode(code) {
  return bcrypt.hash(code, 10);
}

export async function verifyOtpCode(code, hash) {
  return bcrypt.compare(code, hash);
}