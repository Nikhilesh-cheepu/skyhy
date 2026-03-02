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
    const title = typeof body?.title === 'string' ? body.title.trim() : undefined;
    const ctaType = typeof body?.ctaType === 'string' ? body.ctaType : undefined;
    const mediaType = typeof body?.mediaType === 'string' ? body.mediaType : undefined;
    const mediaUrl = typeof body?.mediaUrl === 'string' ? body.mediaUrl : undefined;
    const sortOrder =
      typeof body?.sortOrder === 'number'
        ? body.sortOrder
        : body?.sortOrder != null
        ? Number(body.sortOrder)
        : undefined;

    const offer = await prisma.offer.update({
      where: { id },
      data: {
        ...(title != null && { title }),
        ...(ctaType != null && { ctaType }),
        ...(mediaType != null && { mediaType }),
        ...(mediaUrl != null && { mediaUrl }),
        ...(sortOrder != null && { sortOrder }),
      },
    });
    return NextResponse.json(offer);
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Failed to update offer';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const { id } = await params;
    await prisma.offer.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Failed to delete offer';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

