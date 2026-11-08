import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

type RouteContext = {
  params: Promise<{ id: string }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  try {
    const resolvedParams = await context.params;
    const id = parseInt(resolvedParams.id, 10);

    if (isNaN(id)) {
      return NextResponse.json({ error: 'ID tidak valid' }, { status: 400 });
    }

    const body = await request.json();
    const { status } = body;

    const allowedStatus = ['PENDING', 'DIPROSES', 'SELESAI'];
    if (!status || !allowedStatus.includes(status)) {
      return NextResponse.json(
        { error: `Status tidak valid. Harus salah satu dari: ${allowedStatus.join(', ')}` },
        { status: 400 }
      );
    }

    const updatedPesanan = await prisma.pesanan.update({
      where: { id },
      data: { status },
      include: {
        items: {
          include: {
            menu: true,
          },
        },
      },
    });

    return NextResponse.json(updatedPesanan, { status: 200 });
  } catch (error) {
    console.error('Error updating pesanan:', error);
    return NextResponse.json(
      { error: 'Gagal memperbarui status pesanan' },
      { status: 500 }
    );
  }
}
