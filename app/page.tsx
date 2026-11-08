'use client';

import { useState, useEffect, FormEvent } from 'react';

interface Post {
  id: number;
  title: string;
  content: string;
  createdAt: string;
}

export default function HomePage() {
  const [posts, setPosts] = useState<Post[]>([]);
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const API_ENDPOINT = '/app/api/posts';

  const fetchPosts = async () => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const response = await fetch(API_ENDPOINT);
      if (!response.ok) {
        throw new Error(`HTTP Error: ${response.status}`);
      }
      const data: Post[] = await response.json();
      setPosts(data);
    } catch (error: any) {
      console.error('Fetch error:', error);
      setErrorMessage(error.message || 'Gagal memuat daftar post');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPosts();
  }, []);

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (!title.trim() || !content.trim()) {
      alert('Judul dan konten tidak boleh kosong!');
      return;
    }

    setIsSubmitting(true);
    setErrorMessage(null);

    try {
      const response = await fetch(API_ENDPOINT, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          title: title.trim(),
          content: content.trim(),
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Gagal menambahkan post');
      }

      const createdPost: Post = await response.json();
      setPosts((prev) => [createdPost, ...prev]);
      setTitle('');
      setContent('');
    } catch (error: any) {
      console.error('Submit error:', error);
      setErrorMessage(error.message || 'Terjadi kesalahan saat menambahkan post');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Apakah Anda yakin ingin menghapus post ini?')) {
      return;
    }

    setDeletingId(id);
    setErrorMessage(null);

    try {
      const response = await fetch(`${API_ENDPOINT}/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || 'Gagal menghapus post');
      }

      setPosts((prev) => prev.filter((post) => post.id !== id));
    } catch (error: any) {
      console.error('Delete error:', error);
      alert(error.message || 'Terjadi kesalahan saat menghapus post');
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <main className="max-w-3xl mx-auto px-4 py-8">
      {/* Header */}
      <header className="mb-8 border-b pb-4">
        <h1 className="text-3xl font-extrabold text-slate-900 tracking-tight">
          Daftar Post
        </h1>
        <p className="text-slate-500 mt-1 text-sm">
          Aplikasi full-stack Next.js (App Router) dengan SQLite & Prisma ORM.
        </p>
      </header>

      {/* Error Alert */}
      {errorMessage && (
        <div className="mb-6 p-4 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
          {errorMessage}
        </div>
      )}

      {/* Form Tambah Post */}
      <section className="bg-white rounded-xl shadow-sm border border-slate-200 p-6 mb-8">
        <h2 className="text-lg font-semibold text-slate-800 mb-4">
          Tambah Post Baru
        </h2>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label
              htmlFor="title"
              className="block text-sm font-medium text-slate-700 mb-1"
            >
              Judul Post
            </label>
            <input
              id="title"
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Masukkan judul post..."
              disabled={isSubmitting}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-slate-100 disabled:cursor-not-allowed"
              required
            />
          </div>

          <div>
            <label
              htmlFor="content"
              className="block text-sm font-medium text-slate-700 mb-1"
            >
              Konten
            </label>
            <textarea
              id="content"
              rows={3}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Tuliskan konten post di sini..."
              disabled={isSubmitting}
              className="w-full px-3 py-2 border border-slate-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-slate-100 disabled:cursor-not-allowed resize-y"
              required
            />
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-blue-300 text-white text-sm font-medium rounded-lg shadow-sm transition duration-150 ease-in-out cursor-pointer"
            >
              {isSubmitting ? 'Menyimpan...' : 'Simpan Post'}
            </button>
          </div>
        </form>
      </section>

      {/* Daftar Post List */}
      <section className="space-y-4">
        <h2 className="text-xl font-bold text-slate-800">
          Post Terbaru
        </h2>

        {isLoading ? (
          <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
            <p className="text-slate-500 text-sm">Memuat data post...</p>
          </div>
        ) : posts.length === 0 ? (
          <div className="text-center py-12 bg-white rounded-xl border border-slate-200">
            <p className="text-slate-500 text-sm">Belum ada post yang dibuat.</p>
          </div>
        ) : (
          <div className="space-y-3">
            {posts.map((post) => (
              <article
                key={post.id}
                className="bg-white rounded-xl shadow-sm border border-slate-200 p-5 flex flex-col sm:flex-row justify-between items-start gap-4 transition hover:border-slate-300"
              >
                <div className="space-y-1.5 flex-1">
                  <h3 className="text-base font-semibold text-slate-900">
                    {post.title}
                  </h3>
                  <p className="text-slate-600 text-sm whitespace-pre-wrap">
                    {post.content}
                  </p>
                  <p className="text-xs text-slate-400">
                    {new Date(post.createdAt).toLocaleString('id-ID', {
                      dateStyle: 'medium',
                      timeStyle: 'short',
                    })}
                  </p>
                </div>

                <button
                  type="button"
                  onClick={() => handleDelete(post.id)}
                  disabled={deletingId === post.id}
                  className="px-3 py-1.5 bg-red-50 hover:bg-red-100 disabled:bg-slate-100 text-red-600 disabled:text-slate-400 text-xs font-medium rounded-lg border border-red-200 disabled:border-slate-200 transition cursor-pointer self-end sm:self-center"
                >
                  {deletingId === post.id ? 'Menghapus...' : 'Hapus'}
                </button>
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
