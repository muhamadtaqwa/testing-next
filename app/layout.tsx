import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Daftar Post - Next.js App',
  description: 'Aplikasi full-stack Next.js dengan Prisma SQLite',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className="bg-slate-50 min-h-screen text-slate-800 antialiased">
        {children}
      </body>
    </html>
  );
}
