import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Sistem Pemesanan Kafe',
  description: 'Aplikasi QR Menu & Order Kafe yang ringan dan responsif',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="id">
      <body className="bg-stone-50 min-h-screen text-stone-800 antialiased font-sans">
        {children}
      </body>
    </html>
  );
}
