import { useState, useEffect } from 'react';
import AlertPopup from '../components/AlertPopup';
import { kategoriService } from '../services/api.service';

// AlertPopup → import dari components/AlertPopup (no duplicate)


export default function KategoriPage() {
  const [list, setList] = useState([]);
  const [form, setForm] = useState({ nama: '', deskripsi: '' });
  const [editId, setEditId] = useState(null);
  const [loading, setLoading] = useState(false);
  const [alert, setAlert] = useState(null);
  const [deleteConfirm, setDeleteConfirm] = useState(null);

  const showAlert = (data) => setAlert(data);

  const fetchKategori = async () => {
    const res = await kategoriService.getAll();
    setList(res.data.data);
  };

  useEffect(() => { fetchKategori(); }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (editId) {
        await api.put(`/kategori/${editId}`, form);
        showAlert({ type: 'success', title: 'Berhasil!', message: 'Kategori berhasil diperbarui.' });
      } else {
        await kategoriService.create(form);
        showAlert({ type: 'success', title: 'Berhasil!', message: `Kategori "${form.nama}" berhasil ditambahkan.` });
      }
      setForm({ nama: '', deskripsi: '' });
      setEditId(null);
      fetchKategori();
    } catch (err) {
      showAlert({ type: 'error', title: 'Gagal!', message: err.response?.data?.message || 'Terjadi kesalahan' });
    } finally { setLoading(false); }
  };

  const handleEdit = (item) => {
    setEditId(item.id);
    setForm({ nama: item.nama, deskripsi: item.deskripsi || '' });
  };

  const handleDelete = async () => {
    if (!deleteConfirm) return;
    try {
      await kategoriService.remove(deleteConfirm.id);
      setDeleteConfirm(null);
      showAlert({ type: 'success', title: 'Dihapus!', message: `Kategori "${deleteConfirm.nama}" berhasil dihapus.` });
      fetchKategori();
    } catch {
      setDeleteConfirm(null);
      showAlert({ type: 'error', title: 'Gagal!', message: 'Gagal menghapus kategori.' });
    }
  };

  const handleCancel = () => {
    setEditId(null);
    setForm({ nama: '', deskripsi: '' });
  };

  const S = {
    wrap: { maxWidth: '700px', margin: '0 auto', padding: '24px', fontFamily: "'Plus Jakarta Sans', sans-serif" },
    card: { background: '#fff', border: '2px solid #C9D1DA', borderRadius: '10px', marginBottom: '16px', overflow: 'hidden' },
    head: { padding: '14px 20px', borderBottom: '1.5px solid #DDE3EA' },
    body: { padding: '20px' },
    label: { fontSize: '12px', fontWeight: 600, color: '#374151', display: 'block', marginBottom: '6px' },
    input: { width: '100%', padding: '9px 12px', border: '2px solid #D1D5DB', borderRadius: '7px', fontSize: '13px', fontFamily: 'inherit', outline: 'none', boxSizing: 'border-box', marginBottom: '12px' },
    btn: { padding: '9px 18px', background: '#2563EB', color: '#fff', border: 'none', borderRadius: '7px', fontSize: '13px', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' },
  };

  return (
    <div style={S.wrap}>
      {alert && <AlertPopup alert={alert} onClose={() => setAlert(null)} onConfirm={handleDelete} />}
      {deleteConfirm && (
        <AlertPopup
          alert={{ type: 'delete', title: 'Hapus Kategori?', message: `Kategori "${deleteConfirm.nama}" akan dihapus permanen.`, confirmLabel: 'Hapus' }}
          onClose={() => setDeleteConfirm(null)}
          onConfirm={handleDelete}
        />
      )}

      <h1 style={{ fontSize: '18px', fontWeight: 800, color: '#111827', marginBottom: '20px' }}>Manajemen Kategori</h1>

      {/* Form */}
      <div style={S.card}>
        <div style={S.head}>
          <p style={{ fontSize: '13px', fontWeight: 700, color: '#111827', margin: 0 }}>
            {editId ? 'Edit Kategori' : 'Tambah Kategori Baru'}
          </p>
        </div>
        <div style={S.body}>
          <form onSubmit={handleSubmit}>
            <label style={S.label}>Nama Kategori</label>
            <input style={S.input} value={form.nama} onChange={e => setForm({ ...form, nama: e.target.value })} placeholder="Contoh: Jalan Rusak" required />
            <label style={S.label}>Deskripsi (opsional)</label>
            <input style={S.input} value={form.deskripsi} onChange={e => setForm({ ...form, deskripsi: e.target.value })} placeholder="Deskripsi singkat kategori" />
            <div style={{ display: 'flex', gap: '8px' }}>
              <button type="submit" disabled={loading} style={S.btn}>
                {loading ? 'Menyimpan...' : editId ? 'Simpan Perubahan' : 'Tambah Kategori'}
              </button>
              {editId && (
                <button type="button" onClick={handleCancel} style={{ ...S.btn, background: '#F3F4F6', color: '#374151', border: '1.5px solid #D1D5DB' }}>
                  Batal
                </button>
              )}
            </div>
          </form>
        </div>
      </div>

      {/* List */}
      <div style={S.card}>
        <div style={S.head}>
          <p style={{ fontSize: '13px', fontWeight: 700, color: '#111827', margin: 0 }}>
            Daftar Kategori <span style={{ fontWeight: 400, color: '#9CA3AF' }}>({list.length})</span>
          </p>
        </div>
        {list.length === 0 ? (
          <div style={{ padding: '32px', textAlign: 'center', color: '#9CA3AF', fontSize: '13px' }}>
            Belum ada kategori. Tambahkan kategori pertama.
          </div>
        ) : (
          list.map((item, i) => (
            <div key={item.id} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '12px 20px', borderBottom: '1.5px solid #DDE3EA' }}>
              <div>
                <p style={{ fontSize: '13px', fontWeight: 600, color: '#111827', margin: '0 0 2px' }}>{item.nama}</p>
                {item.deskripsi && <p style={{ fontSize: '11px', color: '#6B7280', margin: 0 }}>{item.deskripsi}</p>}
              </div>
              <div style={{ display: 'flex', gap: '6px' }}>
                <button onClick={() => handleEdit(item)} style={{ padding: '6px 12px', background: '#EFF6FF', color: '#2563EB', border: '1.5px solid #BFDBFE', borderRadius: '6px', fontSize: '12px', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>Edit</button>
                <button onClick={() => setDeleteConfirm(item)} style={{ padding: '6px 12px', background: '#FEF2F2', color: '#EF4444', border: '1.5px solid #FECACA', borderRadius: '6px', fontSize: '12px', fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit' }}>Hapus</button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}