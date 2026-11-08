import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const menus = await prisma.menu.findMany({
      orderBy: [
        { kategori: 'asc' },
        { nama: 'asc' },
      ],
    });
    return NextResponse.json(menus, { status: 200 });
  } catch (error) {
    console.error('Error fetching menus:', error);
    return NextResponse.json(
      { error: 'Gagal mengambil data menu' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { nama, harga, kategori, stok } = body;

    if (!nama || !kategori || typeof harga !== 'number') {
      return NextResponse.json(
        { error: 'Nama, kategori, dan harga valid wajib diisi' },
        { status: 400 }
      );
    }

    const newMenu = await prisma.menu.create({
      data: {
        nama: nama.trim(),
        harga: Number(harga),
        kategori: kategori.trim(),
        stok: typeof stok === 'number' ? Number(stok) : 0,
      },
    });

    return NextResponse.json(newMenu, { status: 201 });
  } catch (error) {
    console.error('Error creating menu:', error);
    return NextResponse.json(
      { error: 'Gagal menambahkan menu' },
      { status: 500 }
    );
  }
}
