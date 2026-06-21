// seed-demo-accounts.js — Buat 2 akun demo (admin + masyarakat) untuk portfolio.
// Tidak menyentuh data lain di database, hanya menambahkan/update 2 user ini.
// Jalankan: node seed-demo-accounts.js
// Lokasi: D:\laporku-web\backend\seed-demo-accounts.js

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Menyiapkan akun demo...');

  const passwordHash = await bcrypt.hash('demo12345', 10);

  // ── Akun Admin Demo ───────────────────────────────────────
  await prisma.user.upsert({
    where: { username: 'admin_demo' },
    update: { passwordHash, role: 'admin', isActive: true },
    create: {
      nama: 'Admin Demo',
      email: 'admin_demo@laporku.id',
      username: 'admin_demo',
      passwordHash,
      role: 'admin',
      phone: '081234500001',
      isActive: true,
      emailVerified: true,
    },
  });
  console.log('✅ Akun Admin Demo siap — username: admin_demo / password: demo12345');

  // ── Akun Masyarakat Demo ──────────────────────────────────
  await prisma.user.upsert({
    where: { username: 'warga_demo' },
    update: { passwordHash, role: 'masyarakat', isActive: true },
    create: {
      nama: 'Warga Demo',
      email: 'warga_demo@laporku.id',
      username: 'warga_demo',
      passwordHash,
      role: 'masyarakat',
      phone: '081234500002',
      isActive: true,
      emailVerified: true,
    },
  });
  console.log('✅ Akun Masyarakat Demo siap — username: warga_demo / password: demo12345');

  console.log('\n🎉 Selesai! Kedua akun demo siap dipakai.');
}

main()
  .catch((e) => { console.error('❌ Error:', e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });