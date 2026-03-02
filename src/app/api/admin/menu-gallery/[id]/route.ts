export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    const body = await request.json();
    const title =
      body?.title === null
        ? null
        : typeof body?.title === 'string'
        ? body.title.trim()
        : undefined;
    const url = typeof body?.url === 'string' ? body.url : undefined;
    const sortOrder =
      typeof body?.sortOrder === 'number'
        ? body.sortOrder
        : body?.sortOrder != null
        ? Number(body.sortOrder)
        : undefined;

    const image = await prisma.menuGalleryImage.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(url !== undefined && { url }),
        ...(sortOrder !== undefined && { sortOrder }),
      },
    });
    return NextResponse.json(image);
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Failed to update menu gallery image';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    await prisma.menuGalleryImage.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Failed to delete menu gallery image';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

