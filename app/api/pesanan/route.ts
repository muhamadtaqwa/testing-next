import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const pesananList = await prisma.pesanan.findMany({
      orderBy: {
        createdAt: 'desc',
      },
      include: {
        items: {
          include: {
            menu: true,
          },
        },
      },
    });

    return NextResponse.json(pesananList, { status: 200 });
  } catch (error) {
    console.error('Error fetching pesanan:', error);
    return NextResponse.json(
      { error: 'Gagal mengambil data pesanan' },
      { status: 500 }
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { nomorMeja, items } = body;

    if (!nomorMeja || typeof nomorMeja !== 'string' || !nomorMeja.trim()) {
      return NextResponse.json(
        { error: 'Nomor meja wajib diisi' },
        { status: 400 }
      );
    }

    if (!Array.isArray(items) || items.length === 0) {
      return NextResponse.json(
        { error: 'Keranjang pesanan tidak boleh kosong' },
        { status: 400 }
      );
    }

    // Hitung total harga
    const total = items.reduce((acc: number, item: any) => {
      const subtotal = Number(item.harga || 0) * Number(item.jumlah || 1);
      return acc + subtotal;
    }, 0);

    const pesanan = await prisma.pesanan.create({
      data: {
        nomorMeja: nomorMeja.trim(),
        total,
        status: 'PENDING',
        items: {
          create: items.map((item: any) => ({
            menuId: Number(item.menuId),
            jumlah: Number(item.jumlah),
            harga: Number(item.harga),
          })),
        },
      },
      include: {
        items: {
          include: {
            menu: true,
          },
        },
      },
    });

    return NextResponse.json(pesanan, { status: 201 });
  } catch (error) {
    console.error('Error creating pesanan:', error);
    return NextResponse.json(
      { error: 'Gagal membuat pesanan' },
      { status: 500 }
    );
  }
}
