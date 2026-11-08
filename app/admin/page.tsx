'use client';

import { useState, useEffect } from 'react';
import { Coffee, UtensilsCrossed, RefreshCw, CheckCircle, Clock, ChefHat, ArrowLeft } from 'lucide-react';
import { getUrl } from '@/lib/path';

interface ItemPesanan {
  id: number;
  menuId: number;
  jumlah: number;
  harga: number;
  menu: {
    nama: string;
    kategori: string;
  };
}

interface Pesanan {
  id: number;
  nomorMeja: string;
  total: number;
  status: 'PENDING' | 'DIPROSES' | 'SELESAI';
  createdAt: string;
  items: ItemPesanan[];
}

export default function AdminPesananPage() {
  const [pesananList, setPesananList] = useState<Pesanan[]>([]);
  const [filterStatus, setFilterStatus] = useState<string>('SEMUA');
  const [isLoading, setIsLoading] = useState(true);
  const [updatingId, setUpdatingId] = useState<number | null>(null);

  const fetchPesanan = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(getUrl('/api/pesanan'));
      if (res.ok) {
        const data = await res.json();
        setPesananList(data);
      }
    } catch (err) {
      console.error('Error fetching pesanan:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPesanan();
    // Auto refresh setiap 15 detik
    const interval = setInterval(fetchPesanan, 15000);
    return () => clearInterval(interval);
  }, []);

  const handleUpdateStatus = async (id: number, newStatus: string) => {
    setUpdatingId(id);
    try {
      const res = await fetch(getUrl(`/api/pesanan/${id}`), {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || 'Gagal mengubah status');
      }

      const updated = await res.json();
      setPesananList((prev) =>
        prev.map((item) => (item.id === id ? { ...item, status: updated.status } : item))
      );
    } catch (err: any) {
      alert(err.message || 'Terjadi kesalahan');
    } finally {
      setUpdatingId(null);
    }
  };

  const filteredList =
    filterStatus === 'SEMUA'
      ? pesananList
      : pesananList.filter((p) => p.status === filterStatus);

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'PENDING':
        return (
          <span className="flex items-center gap-1 px-2.5 py-1 bg-amber-100 text-amber-800 text-xs font-bold rounded-full">
            <Clock className="w-3 h-3" /> PENDING
          </span>
        );
      case 'DIPROSES':
        return (
          <span className="flex items-center gap-1 px-2.5 py-1 bg-blue-100 text-blue-800 text-xs font-bold rounded-full">
            <ChefHat className="w-3 h-3" /> DIPROSES
          </span>
        );
      case 'SELESAI':
        return (
          <span className="flex items-center gap-1 px-2.5 py-1 bg-emerald-100 text-emerald-800 text-xs font-bold rounded-full">
            <CheckCircle className="w-3 h-3" /> SELESAI
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-stone-100 pb-12">
      {/* Header Admin */}
      <header className="bg-white border-b border-stone-200 px-4 py-3 sticky top-0 z-20 shadow-xs">
        <div className="max-w-5xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <a
              href={getUrl('/')}
              className="p-1.5 text-stone-500 hover:text-stone-800 hover:bg-stone-100 rounded-lg transition"
              title="Ke Halaman Menu Pelanggan"
            >
              <ArrowLeft className="w-5 h-5" />
            </a>
            <div>
              <h1 className="text-lg font-bold text-stone-900 leading-tight">
                Panel Barista & Kasir
              </h1>
              <p className="text-xs text-stone-500">Kelola Pesanan Masuk Kafe</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <a
              href={getUrl('/admin/menu')}
              className="flex items-center gap-1.5 px-3 py-1.5 bg-stone-800 hover:bg-stone-900 text-white text-xs font-semibold rounded-xl shadow-xs transition"
            >
              <UtensilsCrossed className="w-3.5 h-3.5" />
              <span>Kelola Menu</span>
            </a>

            <button
              onClick={fetchPesanan}
              disabled={isLoading}
              className="flex items-center gap-1 px-3 py-1.5 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-medium rounded-xl transition cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-5xl mx-auto px-4 py-6">
        {/* Filter Tab Status */}
        <div className="flex items-center gap-2 overflow-x-auto pb-2 mb-6">
          {['SEMUA', 'PENDING', 'DIPROSES', 'SELESAI'].map((st) => {
            const count =
              st === 'SEMUA'
                ? pesananList.length
                : pesananList.filter((p) => p.status === st).length;
            return (
              <button
                key={st}
                onClick={() => setFilterStatus(st)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
                  filterStatus === st
                    ? 'bg-amber-700 text-white shadow-xs'
                    : 'bg-white text-stone-600 border border-stone-200 hover:bg-stone-50'
                }`}
              >
                <span>{st}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full ${
                    filterStatus === st
                      ? 'bg-amber-800 text-amber-200'
                      : 'bg-stone-100 text-stone-600'
                  }`}
                >
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Daftar Kartu Pesanan */}
        {isLoading && pesananList.length === 0 ? (
          <div className="text-center py-20">
            <div className="animate-spin inline-block w-8 h-8 border-4 border-amber-600 border-t-transparent rounded-full mb-2"></div>
            <p className="text-xs text-stone-500">Memuat pesanan...</p>
          </div>
        ) : filteredList.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-2xl border border-stone-200 p-6">
            <Coffee className="w-12 h-12 text-stone-300 mx-auto mb-2" />
            <p className="text-sm font-semibold text-stone-700">Tidak ada pesanan</p>
            <p className="text-xs text-stone-400 mt-1">
              Pesanan baru dari pelanggan akan otomatis muncul di sini.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredList.map((order) => (
              <div
                key={order.id}
                className="bg-white rounded-2xl border border-stone-200 shadow-xs flex flex-col justify-between overflow-hidden"
              >
                {/* Header Kartu */}
                <div className="p-4 bg-stone-50 border-b border-stone-100 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-bold text-stone-400 tracking-wider">
                      ORDER #{order.id}
                    </span>
                    <h3 className="text-base font-extrabold text-stone-900">
                      Meja: {order.nomorMeja}
                    </h3>
                  </div>
                  <div>{getStatusBadge(order.status)}</div>
                </div>

                {/* Items */}
                <div className="p-4 flex-1 space-y-2 text-xs">
                  <div className="text-[11px] font-semibold text-stone-400 uppercase tracking-wider mb-1">
                    Rincian Item:
                  </div>
                  {order.items.map((item) => (
                    <div key={item.id} className="flex justify-between items-center text-stone-700">
                      <div>
                        <span className="font-bold text-stone-900">{item.jumlah}x</span>{' '}
                        <span>{item.menu.nama}</span>
                      </div>
                      <span className="text-stone-500 font-mono">
                        Rp {(item.harga * item.jumlah).toLocaleString('id-ID')}
                      </span>
                    </div>
                  ))}

                  <div className="pt-3 mt-3 border-t border-dashed border-stone-200 flex justify-between items-center text-sm font-bold text-stone-900">
                    <span>Total Pembayaran:</span>
                    <span className="text-amber-900 font-extrabold">
                      Rp {order.total.toLocaleString('id-ID')}
                    </span>
                  </div>
                  <div className="text-[10px] text-stone-400">
                    Waktu: {new Date(order.createdAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>

                {/* Action Button Status */}
                <div className="p-3 bg-stone-50 border-t border-stone-100 flex gap-2">
                  {order.status === 'PENDING' && (
                    <button
                      onClick={() => handleUpdateStatus(order.id, 'DIPROSES')}
                      disabled={updatingId === order.id}
                      className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white font-semibold text-xs rounded-xl transition cursor-pointer shadow-xs"
                    >
                      {updatingId === order.id ? 'Memproses...' : 'Proses Pesanan'}
                    </button>
                  )}

                  {order.status === 'DIPROSES' && (
                    <button
                      onClick={() => handleUpdateStatus(order.id, 'SELESAI')}
                      disabled={updatingId === order.id}
                      className="w-full py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-xs rounded-xl transition cursor-pointer shadow-xs"
                    >
                      {updatingId === order.id ? 'Menyelesaikan...' : 'Tandai Selesai'}
                    </button>
                  )}

                  {order.status === 'SELESAI' && (
                    <div className="w-full py-1.5 text-center text-xs font-semibold text-emerald-700 bg-emerald-50 rounded-xl border border-emerald-200">
                      ✓ Pesanan Selesai
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
