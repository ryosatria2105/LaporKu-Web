import kategoriRepository from '../repositories/kategori.repository.js';

export async function getKategori(req, res) {
  try {
    const data = await kategoriRepository.findAll();
    return res.json({ success: true, data });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}

export async function createKategori(req, res) {
  try {
    const { nama, deskripsi } = req.body;
    if (!nama?.trim())
      return res.status(400).json({ success: false, message: 'Nama kategori wajib diisi' });
    const existing = await kategoriRepository.findByNama(nama.trim());
    if (existing)
      return res.status(409).json({ success: false, message: 'Kategori sudah ada' });
    const data = await kategoriRepository.create({
      nama: nama.trim(), deskripsi: deskripsi?.trim() || null,
    });
    return res.status(201).json({ success: true, message: 'Kategori berhasil ditambahkan', data });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}

export async function updateKategori(req, res) {
  try {
    const { id } = req.params;
    const { nama, deskripsi } = req.body;
    if (!nama?.trim())
      return res.status(400).json({ success: false, message: 'Nama kategori wajib diisi' });
    const existing = await kategoriRepository.findById(id);
    if (!existing)
      return res.status(404).json({ success: false, message: 'Kategori tidak ditemukan' });
    const data = await kategoriRepository.update(id, {
      nama: nama.trim(), deskripsi: deskripsi?.trim() || null,
    });
    return res.json({ success: true, message: 'Kategori berhasil diperbarui', data });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}

export async function deleteKategori(req, res) {
  try {
    const { id } = req.params;
    const existing = await kategoriRepository.findById(id);
    if (!existing)
      return res.status(404).json({ success: false, message: 'Kategori tidak ditemukan' });
    await kategoriRepository.delete(id);
    return res.json({ success: true, message: 'Kategori berhasil dihapus' });
  } catch (err) {
    return res.status(500).json({ success: false, message: 'Server error' });
  }
}