export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextResponse } from 'next/server';
import { getPrisma } from '@/lib/prisma';

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const prisma = getPrisma();
    const { id } = await params;
    const body = await request.json();
    const title = typeof body?.title === 'string' ? body.title.trim() : undefined;
    const eventDateStr = typeof body?.eventDate === 'string' ? body.eventDate : undefined;
    const ticketPrice =
      typeof body?.ticketPrice === 'number'
        ? body.ticketPrice
        : body?.ticketPrice != null
        ? Number(body.ticketPrice)
        : undefined;
    const mediaType = typeof body?.mediaType === 'string' ? body.mediaType : undefined;
    const mediaUrl = typeof body?.mediaUrl === 'string' ? body.mediaUrl : undefined;
    const sortOrder =
      typeof body?.sortOrder === 'number'
        ? body.sortOrder
        : body?.sortOrder != null
        ? Number(body.sortOrder)
        : undefined;
    const isActive =
      body?.isActive !== undefined ? Boolean(body.isActive) : undefined;

    let eventDate: Date | undefined | null;
    if (eventDateStr !== undefined) {
      if (eventDateStr === '') {
        eventDate = null;
      } else {
        const d = new Date(eventDateStr);
        if (Number.isNaN(d.getTime())) {
          return NextResponse.json({ error: 'Invalid eventDate' }, { status: 400 });
        }
        eventDate = d;
      }
    }

    const event = await prisma.event.update({
      where: { id },
      data: {
        ...(title !== undefined && { title }),
        ...(eventDate !== undefined && { eventDate }),
        ...(ticketPrice !== undefined && { ticketPrice }),
        ...(mediaType !== undefined && { mediaType }),
        ...(mediaUrl !== undefined && { mediaUrl }),
        ...(sortOrder !== undefined && { sortOrder }),
        ...(isActive !== undefined && { isActive }),
      },
    });
    return NextResponse.json(event);
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Failed to update event';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const prisma = getPrisma();
    const { id } = await params;
    await prisma.event.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Failed to delete event';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

