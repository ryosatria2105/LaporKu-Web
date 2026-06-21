// seed.js — Data dummy 1000 user masyarakat + 1000 laporan
// Jalankan: node seed.js
// Lokasi: D:\laporku-web\backend\seed.js

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

// ── Data acak ───────────────────────────────────────────────
const namaDepan = ['Andi','Budi','Citra','Desi','Eko','Fani','Gita','Hadi','Indah','Joko','Kiki','Lina','Miko','Nina','Omar','Putri','Rudi','Sari','Tono','Umar','Vina','Wati','Xena','Yudi','Zara','Agus','Bella','Dian','Fajar','Hana'];
const namaBelakang = ['Santoso','Wijaya','Kusuma','Pratama','Setiawan','Hidayat','Saputra','Wibowo','Nugroho','Rahayu','Susanto','Hartono','Gunawan','Kurniawan','Lestari','Andriani','Purnomo','Handoko','Mahendra','Suryadi'];
const kota = ['Surabaya','Sidoarjo','Gresik','Mojokerto','Malang','Pasuruan','Probolinggo','Jember','Blitar','Kediri'];
const kecamatan = ['Wonokromo','Gubeng','Rungkut','Genteng','Sawahan','Sukomanunggal','Waru','Gedangan','Taman','Buduran'];
const judulLaporan = [
  'Jalan Berlubang di','Lampu Jalan Mati di','Sampah Menumpuk di','Banjir di','Pohon Tumbang di',
  'Trotoar Rusak di','Got Tersumbat di','Fasilitas Umum Rusak di','Vandalisme di','Kebisingan di',
  'Drainase Buruk di','Tiang Listrik Miring di','Rambu Lalu Lintas Rusak di','Tempat Sampah Penuh di','Jembatan Rusak di',
];
const kategoriNama = ['Infrastruktur','Lingkungan','Keamanan','Pelayanan Publik','Bencana Alam'];
const statusList = ['menunggu','menunggu','menunggu','diproses','diproses','selesai','ditolak'];
const keteranganList = [
  'Kondisi sangat mengkhawatirkan dan perlu segera ditangani oleh pihak berwenang.',
  'Sudah berlangsung selama beberapa minggu dan mengganggu aktivitas warga sekitar.',
  'Banyak warga yang mengeluh dan berharap segera ada penanganan dari pemerintah.',
  'Situasi semakin parah terutama saat musim hujan tiba.',
  'Mohon segera ditindaklanjuti demi kenyamanan dan keselamatan masyarakat.',
  'Kondisi ini membahayakan pengguna jalan dan perlu penanganan cepat.',
  'Warga sekitar sudah melaporkan berkali-kali namun belum ada tindakan.',
  'Perlu perhatian khusus dari dinas terkait untuk menyelesaikan masalah ini.',
];

const rand = (arr) => arr[Math.floor(Math.random() * arr.length)];
const randInt = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

async function main() {
  console.log('🌱 Mulai seeding...');

  // ── 1. Ambil kategori yang sudah ada ──────────────────────
  let kategoriList = await prisma.kategori.findMany();
  if (kategoriList.length === 0) {
    console.log('📂 Buat kategori default...');
    await prisma.kategori.createMany({
      data: kategoriNama.map(nama => ({ nama, deskripsi: `Kategori ${nama}` })),
      skipDuplicates: true,
    });
    kategoriList = await prisma.kategori.findMany();
  }
  console.log(`✅ ${kategoriList.length} kategori tersedia`);

  // ── 2. Buat 1000 user masyarakat ──────────────────────────
  console.log('👥 Membuat 1000 user masyarakat...');
  const passwordHash = await bcrypt.hash('password123', 10);
  
  const usersData = [];
  for (let i = 1; i <= 1000; i++) {
    const nama = `${rand(namaDepan)} ${rand(namaBelakang)}`;
    const email = `user${i}_${Date.now()}${Math.random().toString(36).slice(2,6)}@dummy.laporku.id`;
    usersData.push({
      nama,
      email,
      username: `user_dummy_${i}`,
      passwordHash,
      role: 'masyarakat',
      phone: `08${randInt(100000000, 999999999)}`,
      isActive: true,
      emailVerified: false,
    });
  }

  // Insert batch 100 sekaligus supaya cepat
  let userCount = 0;
  for (let i = 0; i < usersData.length; i += 100) {
    await prisma.user.createMany({
      data: usersData.slice(i, i + 100),
      skipDuplicates: true,
    });
    userCount += 100;
    process.stdout.write(`\r   Progress user: ${Math.min(userCount, 1000)}/1000`);
  }
  console.log('\n✅ 1000 user masyarakat dibuat');

  // ── 3. Ambil semua user masyarakat ────────────────────────
  const users = await prisma.user.findMany({
    where: { role: 'masyarakat' },
    select: { id: true, nama: true, phone: true },
    take: 1000,
    orderBy: { id: 'desc' },
  });

  // ── 4. Buat 1000 laporan ──────────────────────────────────
  console.log('📋 Membuat 1000 laporan...');
  const laporanData = [];
  
  for (let i = 1; i <= 1000; i++) {
    const user = rand(users);
    const kat = rand(kategoriList);
    const kec = rand(kecamatan);
    const kot = rand(kota);
    const status = rand(statusList);
    const judul = `${rand(judulLaporan)} ${kec}, ${kot}`;
    const lokasi = `${kec}, ${kot}, Jawa Timur, Indonesia`;
    
    // Buat tanggal random 1-90 hari ke belakang
    const daysAgo = randInt(0, 90);
    const createdAt = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);
    
    laporanData.push({
      id: `RPT-${Date.now()}${i}-DUMMY`,
      judul,
      keterangan: rand(keteranganList),
      lokasi,
      kategori: kat.nama,
      status,
      userId: user.id,
      nama: user.nama,
      nohp: user.phone || '081234567890',
      gambar: null,
      catatanAdmin: status === 'ditolak' ? 'Laporan tidak memenuhi kriteria pelaporan.' : null,
      createdAt,
      updatedAt: createdAt,
    });
  }

  // Insert batch 100 sekaligus
  let lapCount = 0;
  for (let i = 0; i < laporanData.length; i += 100) {
    await prisma.laporan.createMany({
      data: laporanData.slice(i, i + 100),
      skipDuplicates: true,
    });
    lapCount += 100;
    process.stdout.write(`\r   Progress laporan: ${Math.min(lapCount, 1000)}/1000`);
  }
  console.log('\n✅ 1000 laporan dibuat');

  // ── 5. Summary ────────────────────────────────────────────
  const totalUser = await prisma.user.count({ where: { role: 'masyarakat' } });
  const totalLaporan = await prisma.laporan.count();
  console.log('\n🎉 Seeding selesai!');
  console.log(`   Total user masyarakat : ${totalUser}`);
  console.log(`   Total laporan         : ${totalLaporan}`);
}

main()
  .catch((e) => { console.error('❌ Error:', e); process.exit(1); })
  .finally(async () => { await prisma.$disconnect(); });