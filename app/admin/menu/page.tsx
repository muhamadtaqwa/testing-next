'use client';

import { useState, useEffect, FormEvent } from 'react';
import { Plus, Trash, ArrowLeft, Coffee, UtensilsCrossed } from 'lucide-react';
import { getUrl } from '@/lib/path';

interface Menu {
  id: number;
  nama: string;
  harga: number;
  kategori: string;
  stok: number;
}

export default function AdminMenuManagementPage() {
  const [menus, setMenus] = useState<Menu[]>([]);
  const [nama, setNama] = useState('');
  const [harga, setHarga] = useState('');
  const [kategori, setKategori] = useState('Kopi');
  const [stok, setStok] = useState('50');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);

  const fetchMenu = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(getUrl('/api/menu'));
      if (res.ok) {
        const data = await res.json();
        setMenus(data);
      }
    } catch (err) {
      console.error('Failed to fetch menu:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMenu();
  }, []);

  const handleAddMenu = async (e: FormEvent) => {
    e.preventDefault();
    if (!nama.trim() || !harga) {
      alert('Nama dan harga menu wajib diisi!');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(getUrl('/api/menu'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nama: nama.trim(),
          harga: Number(harga),
          kategori: kategori.trim(),
          stok: Number(stok) || 0,
        }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Gagal menambahkan menu');
      }

      const newMenu = await res.json();
      setMenus((prev) => [...prev, newMenu]);
      setNama('');
      setHarga('');
      setStok('50');
    } catch (err: any) {
      alert(err.message || 'Terjadi kesalahan saat menyimpan menu.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Apakah Anda yakin ingin menghapus menu ini?')) return;

    setDeletingId(id);
    try {
      const res = await fetch(getUrl(`/api/menu/${id}`), {
        method: 'DELETE',
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Gagal menghapus menu');
      }

      setMenus((prev) => prev.filter((m) => m.id !== id));
    } catch (err: any) {
      alert(err.message || 'Gagal menghapus menu');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="min-h-screen bg-stone-100 pb-12">
      {/* Header */}
      <header className="bg-white border-b border-stone-200 px-4 py-3 sticky top-0 z-20 shadow-xs">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <a
              href={getUrl('/admin')}
              className="p-1.5 text-stone-500 hover:text-stone-800 hover:bg-stone-100 rounded-lg transition"
              title="Kembali ke Daftar Pesanan"
            >
              <ArrowLeft className="w-5 h-5" />
            </a>
            <div>
              <h1 className="text-lg font-bold text-stone-900 leading-tight">
                Kelola Daftar Menu
              </h1>
              <p className="text-xs text-stone-500">Tambah & Hapus Menu Kafe</p>
            </div>
          </div>

          <a
            href={getUrl('/')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-amber-700 hover:bg-amber-800 text-white text-xs font-semibold rounded-xl shadow-xs transition"
          >
            <Coffee className="w-3.5 h-3.5" />
            <span>Katalog Pelanggan</span>
          </a>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 py-6 space-y-6">
        {/* Form Tambah Menu */}
        <section className="bg-white rounded-2xl border border-stone-200 p-5 shadow-xs">
          <h2 className="text-sm font-bold text-stone-900 mb-4 flex items-center gap-2">
            <Plus className="w-4 h-4 text-amber-700" />
            Tambah Menu Baru
          </h2>

          <form onSubmit={handleAddMenu} className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3">
            <div>
              <label htmlFor="namaMenu" className="block text-xs font-semibold text-stone-600 mb-1">
                Nama Menu
              </label>
              <input
                id="namaMenu"
                type="text"
                placeholder="Contoh: Kopi Susu Gula Aren"
                value={nama}
                onChange={(e) => setNama(e.target.value)}
                required
                className="w-full px-3 py-2 border border-stone-300 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="kategoriMenu" className="block text-xs font-semibold text-stone-600 mb-1">
                Kategori
              </label>
              <select
                id="kategoriMenu"
                value={kategori}
                onChange={(e) => setKategori(e.target.value)}
                className="w-full px-3 py-2 border border-stone-300 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none bg-white"
              >
                <option value="Kopi">Kopi</option>
                <option value="Non-Kopi">Non-Kopi</option>
                <option value="Makanan">Makanan</option>
                <option value="Camilan">Camilan</option>
                <option value="Lainnya">Lainnya</option>
              </select>
            </div>

            <div>
              <label htmlFor="hargaMenu" className="block text-xs font-semibold text-stone-600 mb-1">
                Harga (Rp)
              </label>
              <input
                id="hargaMenu"
                type="number"
                placeholder="Contoh: 18000"
                value={harga}
                onChange={(e) => setHarga(e.target.value)}
                required
                min="0"
                className="w-full px-3 py-2 border border-stone-300 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
              />
            </div>

            <div>
              <label htmlFor="stokMenu" className="block text-xs font-semibold text-stone-600 mb-1">
                Stok Awal
              </label>
              <div className="flex gap-2">
                <input
                  id="stokMenu"
                  type="number"
                  placeholder="50"
                  value={stok}
                  onChange={(e) => setStok(e.target.value)}
                  min="0"
                  className="w-full px-3 py-2 border border-stone-300 rounded-xl text-xs focus:ring-2 focus:ring-amber-500 focus:outline-none"
                />
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-4 py-2 bg-amber-700 hover:bg-amber-800 disabled:bg-amber-300 text-white font-bold text-xs rounded-xl shadow-xs transition cursor-pointer whitespace-nowrap"
                >
                  {isSubmitting ? 'Menyimpan...' : 'Simpan'}
                </button>
              </div>
            </div>
          </form>
        </section>

        {/* Tabel Menu */}
        <section className="bg-white rounded-2xl border border-stone-200 overflow-hidden shadow-xs">
          <div className="p-4 border-b border-stone-100 flex items-center justify-between">
            <h2 className="text-sm font-bold text-stone-900 flex items-center gap-2">
              <UtensilsCrossed className="w-4 h-4 text-amber-700" />
              Daftar Semua Menu ({menus.length})
            </h2>
          </div>

          {isLoading ? (
            <div className="text-center py-12 text-xs text-stone-500">Memuat data menu...</div>
          ) : menus.length === 0 ? (
            <div className="text-center py-12 text-xs text-stone-400">
              Belum ada menu yang tersimpan. Silakan isi form di atas.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-stone-50 border-b border-stone-200 text-stone-500 uppercase tracking-wider font-semibold">
                  <tr>
                    <th className="py-3 px-4">Nama Menu</th>
                    <th className="py-3 px-4">Kategori</th>
                    <th className="py-3 px-4">Harga</th>
                    <th className="py-3 px-4">Stok</th>
                    <th className="py-3 px-4 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-100">
                  {menus.map((item) => (
                    <tr key={item.id} className="hover:bg-stone-50/50 transition">
                      <td className="py-3 px-4 font-semibold text-stone-900">{item.nama}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 bg-stone-100 text-stone-600 rounded-md text-[10px] font-bold">
                          {item.kategori}
                        </span>
                      </td>
                      <td className="py-3 px-4 font-mono font-bold text-amber-900">
                        Rp {item.harga.toLocaleString('id-ID')}
                      </td>
                      <td className="py-3 px-4 text-stone-600">{item.stok}</td>
                      <td className="py-3 px-4 text-right">
                        <button
                          onClick={() => handleDelete(item.id)}
                          disabled={deletingId === item.id}
                          className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg cursor-pointer transition disabled:opacity-50"
                          title="Hapus Menu"
                        >
                          <Trash className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
