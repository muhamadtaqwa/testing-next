'use client';

import { useState, useEffect } from 'react';
import { ShoppingCart, Plus, Minus, Trash, CheckCircle, Coffee, ArrowRight, Shield } from 'lucide-react';
import { getUrl } from '@/lib/path';

interface Menu {
  id: number;
  nama: string;
  harga: number;
  kategori: string;
  stok: number;
}

interface CartItem {
  menuId: number;
  nama: string;
  harga: number;
  jumlah: number;
}

export default function CustomerMenuPage() {
  const [menus, setMenus] = useState<Menu[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [nomorMeja, setNomorMeja] = useState('');
  const [selectedKategori, setSelectedKategori] = useState('Semua');
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [orderSuccess, setOrderSuccess] = useState<any | null>(null);

  // Load menu dari API
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

    // Cek nomor meja dari parameter URL (misal: /app?meja=05)
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const mejaParam = params.get('meja');
      if (mejaParam) {
        setNomorMeja(mejaParam);
      }

      // Ambil keranjang dari localStorage jika ada
      const savedCart = localStorage.getItem('kafe_cart');
      if (savedCart) {
        try {
          setCart(JSON.parse(savedCart));
        } catch (_) {}
      }
    }
  }, []);

  // Simpan keranjang ke localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('kafe_cart', JSON.stringify(cart));
    }
  }, [cart]);

  const addToCart = (menu: Menu) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.menuId === menu.id);
      if (existing) {
        return prev.map((item) =>
          item.menuId === menu.id ? { ...item, jumlah: item.jumlah + 1 } : item
        );
      }
      return [...prev, { menuId: menu.id, nama: menu.nama, harga: menu.harga, jumlah: 1 }];
    });
  };

  const updateQuantity = (menuId: number, delta: number) => {
    setCart((prev) => {
      return prev
        .map((item) => {
          if (item.menuId === menuId) {
            const newQty = item.jumlah + delta;
            return newQty > 0 ? { ...item, jumlah: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[];
    });
  };

  const removeFromCart = (menuId: number) => {
    setCart((prev) => prev.filter((item) => item.menuId !== menuId));
  };

  const totalHarga = cart.reduce((acc, item) => acc + item.harga * item.jumlah, 0);
  const totalItemCount = cart.reduce((acc, item) => acc + item.jumlah, 0);

  const handleCheckout = async () => {
    if (!nomorMeja.trim()) {
      alert('Mohon masukkan Nomor Meja Anda!');
      return;
    }
    if (cart.length === 0) {
      alert('Keranjang Anda masih kosong!');
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch(getUrl('/api/pesanan'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nomorMeja: nomorMeja.trim(),
          items: cart,
        }),
      });

      if (!res.ok) {
        const errorData = await res.json().catch(() => ({}));
        throw new Error(errorData.error || 'Gagal mengirim pesanan');
      }

      const orderData = await res.json();
      setOrderSuccess(orderData);
      setCart([]);
      if (typeof window !== 'undefined') {
        localStorage.removeItem('kafe_cart');
      }
    } catch (err: any) {
      alert(err.message || 'Terjadi kesalahan saat memproses pesanan.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const kategoriList = ['Semua', ...Array.from(new Set(menus.map((m) => m.kategori)))];
  const filteredMenus =
    selectedKategori === 'Semua'
      ? menus
      : menus.filter((m) => m.kategori === selectedKategori);

  return (
    <div className="min-h-screen bg-stone-50 pb-28 md:pb-12">
      {/* Header Bar */}
      <header className="sticky top-0 z-30 bg-white/90 backdrop-blur-md border-b border-stone-200 px-4 py-3 shadow-xs">
        <div className="max-w-4xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-amber-600 rounded-xl text-white">
              <Coffee className="w-5 h-5" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-stone-900 leading-tight">Kafe Digital</h1>
              <p className="text-xs text-stone-500">
                {nomorMeja ? `Meja ${nomorMeja}` : 'Pilih Menu & Pesan Langsung'}
              </p>
            </div>
          </div>

          <a
            href={getUrl('/admin')}
            className="flex items-center gap-1 text-xs font-medium text-stone-500 hover:text-stone-800 bg-stone-100 hover:bg-stone-200 px-3 py-1.5 rounded-lg transition"
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Admin</span>
          </a>
        </div>
      </header>

      {/* Konten Utama */}
      <main className="max-w-4xl mx-auto px-4 py-6">
        {/* Banner Meja */}
        <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h2 className="text-sm font-semibold text-amber-900">Selamat Datang di Kafe Kami!</h2>
            <p className="text-xs text-amber-700">Silakan tentukan nomor meja dan pilih pesanan Anda.</p>
          </div>
          <div className="flex items-center gap-2">
            <label htmlFor="mejaInput" className="text-xs font-semibold text-amber-900 whitespace-nowrap">
              No. Meja:
            </label>
            <input
              id="mejaInput"
              type="text"
              placeholder="Contoh: 05"
              value={nomorMeja}
              onChange={(e) => setNomorMeja(e.target.value)}
              className="w-24 px-2.5 py-1.5 bg-white border border-amber-300 rounded-lg text-sm font-semibold text-center text-stone-800 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
        </div>

        {/* Tab Kategori */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-6 scrollbar-none">
          {kategoriList.map((kat) => (
            <button
              key={kat}
              onClick={() => setSelectedKategori(kat)}
              className={`px-4 py-2 rounded-xl text-xs font-medium whitespace-nowrap transition cursor-pointer ${
                selectedKategori === kat
                  ? 'bg-amber-700 text-white shadow-xs'
                  : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-100'
              }`}
            >
              {kat}
            </button>
          ))}
        </div>

        {/* Daftar Menu */}
        {isLoading ? (
          <div className="text-center py-16">
            <div className="animate-spin inline-block w-8 h-8 border-4 border-amber-600 border-t-transparent rounded-full mb-2"></div>
            <p className="text-xs text-stone-500">Memuat daftar menu...</p>
          </div>
        ) : filteredMenus.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-2xl border border-stone-200">
            <Coffee className="w-10 h-10 text-stone-300 mx-auto mb-2" />
            <p className="text-sm font-medium text-stone-600">Belum ada menu di kategori ini</p>
            <p className="text-xs text-stone-400 mt-1">Silakan tambahkan menu melalui panel Admin</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredMenus.map((menu) => {
              const inCart = cart.find((c) => c.menuId === menu.id);
              return (
                <div
                  key={menu.id}
                  className="bg-white rounded-2xl border border-stone-200 p-4 flex flex-col justify-between shadow-xs hover:shadow-md transition"
                >
                  <div>
                    <span className="inline-block px-2 py-0.5 bg-stone-100 text-stone-600 text-[10px] font-semibold uppercase tracking-wider rounded-md mb-2">
                      {menu.kategori}
                    </span>
                    <h3 className="font-bold text-stone-900 text-base mb-1">{menu.nama}</h3>
                    <p className="text-xs text-stone-400 mb-3">Stok tersedia: {menu.stok}</p>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-stone-100 mt-2">
                    <span className="font-extrabold text-amber-800 text-base">
                      Rp {menu.harga.toLocaleString('id-ID')}
                    </span>

                    {inCart ? (
                      <div className="flex items-center gap-1.5 bg-amber-50 border border-amber-200 rounded-lg p-1">
                        <button
                          onClick={() => updateQuantity(menu.id, -1)}
                          className="p-1 hover:bg-amber-100 rounded text-amber-800 cursor-pointer"
                        >
                          <Minus className="w-3.5 h-3.5" />
                        </button>
                        <span className="text-xs font-bold text-amber-900 w-5 text-center">
                          {inCart.jumlah}
                        </span>
                        <button
                          onClick={() => updateQuantity(menu.id, 1)}
                          className="p-1 hover:bg-amber-100 rounded text-amber-800 cursor-pointer"
                        >
                          <Plus className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    ) : (
                      <button
                        onClick={() => addToCart(menu)}
                        className="flex items-center gap-1 px-3 py-1.5 bg-amber-700 hover:bg-amber-800 text-white text-xs font-semibold rounded-xl shadow-xs transition cursor-pointer"
                      >
                        <Plus className="w-3.5 h-3.5" />
                        <span>Tambah</span>
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Floating Bottom Bar (Khusus Mobile / Responsive) */}
      {cart.length > 0 && !isCartOpen && (
        <div className="fixed bottom-4 left-4 right-4 z-40 max-w-4xl mx-auto">
          <div className="bg-stone-900 text-white rounded-2xl p-3 shadow-xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="relative p-2 bg-stone-800 rounded-xl">
                <ShoppingCart className="w-5 h-5 text-amber-400" />
                <span className="absolute -top-1 -right-1 bg-amber-500 text-stone-900 font-extrabold text-[10px] w-4 h-4 rounded-full flex items-center justify-center">
                  {totalItemCount}
                </span>
              </div>
              <div>
                <p className="text-xs text-stone-400">{totalItemCount} Item Dipilih</p>
                <p className="text-sm font-bold text-white">
                  Rp {totalHarga.toLocaleString('id-ID')}
                </p>
              </div>
            </div>

            <button
              onClick={() => setIsCartOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs rounded-xl shadow-sm transition cursor-pointer"
            >
              <span>Lihat Pesanan</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* Modal / Drawer Keranjang */}
      {isCartOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex justify-end">
          <div className="bg-white w-full max-w-md h-full flex flex-col shadow-2xl animate-in slide-in-from-right duration-200">
            {/* Header Modal */}
            <div className="p-4 border-b border-stone-200 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <ShoppingCart className="w-5 h-5 text-amber-700" />
                <h3 className="font-bold text-stone-900 text-base">Keranjang Pesanan</h3>
              </div>
              <button
                onClick={() => setIsCartOpen(false)}
                className="text-stone-400 hover:text-stone-700 p-1 text-sm font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            {/* List Item Keranjang */}
            <div className="flex-1 overflow-y-auto p-4 space-y-3">
              {cart.length === 0 ? (
                <div className="text-center py-12 text-stone-400">
                  <ShoppingCart className="w-12 h-12 mx-auto mb-2 opacity-30" />
                  <p className="text-sm">Keranjang Anda kosong</p>
                </div>
              ) : (
                cart.map((item) => (
                  <div
                    key={item.menuId}
                    className="flex items-center justify-between p-3 bg-stone-50 rounded-xl border border-stone-200"
                  >
                    <div className="flex-1 pr-2">
                      <h4 className="font-semibold text-stone-900 text-sm">{item.nama}</h4>
                      <p className="text-xs text-amber-800 font-bold">
                        Rp {item.harga.toLocaleString('id-ID')}
                      </p>
                    </div>

                    <div className="flex items-center gap-2">
                      <div className="flex items-center gap-1 bg-white border border-stone-300 rounded-lg p-0.5">
                        <button
                          onClick={() => updateQuantity(item.menuId, -1)}
                          className="p-1 hover:bg-stone-100 rounded text-stone-700 cursor-pointer"
                        >
                          <Minus className="w-3 h-3" />
                        </button>
                        <span className="text-xs font-bold text-stone-900 w-5 text-center">
                          {item.jumlah}
                        </span>
                        <button
                          onClick={() => updateQuantity(item.menuId, 1)}
                          className="p-1 hover:bg-stone-100 rounded text-stone-700 cursor-pointer"
                        >
                          <Plus className="w-3 h-3" />
                        </button>
                      </div>

                      <button
                        onClick={() => removeFromCart(item.menuId)}
                        className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg cursor-pointer"
                      >
                        <Trash className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Footer & Checkout */}
            {cart.length > 0 && (
              <div className="p-4 border-t border-stone-200 bg-stone-50 space-y-4">
                <div>
                  <label htmlFor="modalMeja" className="block text-xs font-semibold text-stone-700 mb-1">
                    Nomor Meja Pemesan (Wajib Diisi):
                  </label>
                  <input
                    id="modalMeja"
                    type="text"
                    placeholder="Contoh: Meja 05"
                    value={nomorMeja}
                    onChange={(e) => setNomorMeja(e.target.value)}
                    className="w-full px-3 py-2 bg-white border border-stone-300 rounded-xl text-sm font-semibold text-stone-900 focus:outline-none focus:ring-2 focus:ring-amber-500"
                  />
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-stone-200">
                  <span className="text-sm font-semibold text-stone-600">Total Pembayaran:</span>
                  <span className="text-lg font-black text-amber-900">
                    Rp {totalHarga.toLocaleString('id-ID')}
                  </span>
                </div>

                <button
                  onClick={handleCheckout}
                  disabled={isSubmitting}
                  className="w-full py-3 bg-amber-700 hover:bg-amber-800 disabled:bg-amber-400 text-white font-bold text-sm rounded-xl shadow-md transition cursor-pointer"
                >
                  {isSubmitting ? 'Memproses Pesanan...' : 'Pesan Sekarang'}
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Modal Sukses Order */}
      {orderSuccess && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-sm w-full p-6 text-center shadow-2xl animate-in zoom-in-95 duration-150">
            <CheckCircle className="w-16 h-16 text-emerald-500 mx-auto mb-3" />
            <h3 className="text-xl font-black text-stone-900 mb-1">Pesanan Berhasil!</h3>
            <p className="text-xs text-stone-500 mb-4">
              Nomor Pesanan: <span className="font-bold text-stone-800">#{orderSuccess.id}</span>
            </p>

            <div className="bg-stone-50 border border-stone-200 rounded-2xl p-4 text-left text-xs mb-5 space-y-1.5">
              <div className="flex justify-between">
                <span className="text-stone-500">Nomor Meja:</span>
                <span className="font-bold text-stone-900">{orderSuccess.nomorMeja}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Status:</span>
                <span className="px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold text-[10px]">
                  {orderSuccess.status}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-stone-500">Total:</span>
                <span className="font-black text-stone-900">
                  Rp {orderSuccess.total.toLocaleString('id-ID')}
                </span>
              </div>
            </div>

            <p className="text-xs text-stone-500 mb-5">
              Silakan duduk manis, pesanan Anda sedang disiapkan oleh barista kami.
            </p>

            <button
              onClick={() => {
                setOrderSuccess(null);
                setIsCartOpen(false);
              }}
              className="w-full py-2.5 bg-stone-900 hover:bg-stone-800 text-white font-semibold text-xs rounded-xl shadow-xs transition cursor-pointer"
            >
              Tutup & Buat Pesanan Baru
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
