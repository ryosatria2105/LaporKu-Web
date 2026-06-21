// =============================================================
// REPOSITORY PATTERN diimplementasikan di sini
// Controller tidak akses Prisma langsung — semua lewat repository
// Referensi: https://refactoring.guru/design-patterns/repository
// =============================================================
import path from 'path';
import fs   from 'fs';
import profilRepository from '../repositories/profil.repository.js';
import { hashPassword, verifyPassword } from '../utils/security.js';

// GET /api/v1/profil
export async function getProfil(req, res) {
  try {
    const user = await profilRepository.findById(req.user.id);
    return res.json({ success: true, data: user });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}

// PATCH /api/v1/profil
export async function updateProfil(req, res) {
  try {
    const { nama, phone } = req.body;
    if (!nama?.trim())
      return res.status(400).json({ success: false, message: 'Nama wajib diisi' });

    const user = await profilRepository.update(req.user.id, {
      nama:  nama.trim(),
      phone: phone?.trim() || null,
    });
    return res.json({ success: true, message: 'Profil berhasil diperbarui', data: user });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}

// POST /api/v1/profil/foto
export async function uploadFoto(req, res) {
  try {
    if (!req.file)
      return res.status(400).json({ success: false, message: 'File foto wajib diupload' });

    // Hapus foto lama kalau ada
    const existing = await profilRepository.findById(req.user.id);
    if (existing?.fotoProfil) {
      const oldPath = path.join(process.cwd(), 'uploads', path.basename(existing.fotoProfil));
      if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);
    }

    const fotoUrl = `/uploads/${req.file.filename}`;
    const user    = await profilRepository.updateFoto(req.user.id, fotoUrl);
    return res.json({ success: true, message: 'Foto profil berhasil diperbarui', data: user });
  } catch (err) {
    if (req.file) fs.unlinkSync(req.file.path);
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}

// PATCH /api/v1/profil/password
export async function updatePassword(req, res) {
  try {
    const { password_lama, password_baru, konfirmasi_password } = req.body;
    if (!password_lama || !password_baru || !konfirmasi_password)
      return res.status(400).json({ success: false, message: 'Semua field wajib diisi' });
    if (password_baru !== konfirmasi_password)
      return res.status(400).json({ success: false, message: 'Password baru tidak sama' });
    if (password_baru.length < 8)
      return res.status(400).json({ success: false, message: 'Password minimal 8 karakter' });

    const passwordHash = await profilRepository.getPasswordHash(req.user.id);
    const valid        = await verifyPassword(password_lama, passwordHash);
    if (!valid)
      return res.status(400).json({ success: false, message: 'Password lama salah' });

    const newHash = await hashPassword(password_baru);
    await profilRepository.updatePassword(req.user.id, newHash);
    return res.json({ success: true, message: 'Password berhasil diperbarui' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}

// DELETE /api/v1/profil/foto
export async function deleteFoto(req, res) {
  try {
    const existing = await profilRepository.findById(req.user.id);
    if (!existing?.fotoProfil)
      return res.status(400).json({ success: false, message: 'Tidak ada foto profil untuk dihapus' });

    // Hapus file fisik dari disk
    const oldPath = path.join(process.cwd(), 'uploads', path.basename(existing.fotoProfil));
    if (fs.existsSync(oldPath)) fs.unlinkSync(oldPath);

    // Set fotoProfil ke null di database
    const user = await profilRepository.updateFoto(req.user.id, null);
    return res.json({ success: true, message: 'Foto profil berhasil dihapus', data: user });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}   