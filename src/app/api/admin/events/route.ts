export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextResponse } from 'next/server';
import { getPrisma } from '@/lib/prisma';

export async function GET() {
  try {
    const prisma = getPrisma();
    const events = await prisma.event.findMany({
      orderBy: [{ sortOrder: 'asc' }, { eventDate: 'asc' }],
    });
    return NextResponse.json(events);
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Failed to fetch events';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const prisma = getPrisma();
    const body = await request.json();
    const title = typeof body?.title === 'string' ? body.title.trim() : '';
    const eventDateStr = typeof body?.eventDate === 'string' ? body.eventDate : '';
    const endDateStr = typeof body?.endDate === 'string' ? body.endDate : '';
    const ticketPrice =
      typeof body?.ticketPrice === 'number'
        ? body.ticketPrice
        : body?.ticketPrice != null
        ? Number(body.ticketPrice)
        : 0;
    const mediaType = typeof body?.mediaType === 'string' ? body.mediaType : 'image';
    const mediaUrl = typeof body?.mediaUrl === 'string' ? body.mediaUrl : '';
    const notes = typeof body?.notes === 'string' ? body.notes.trim() : '';

    if (!mediaUrl) {
      return NextResponse.json({ error: 'mediaUrl is required' }, { status: 400 });
    }

    let eventDate: Date | undefined;
    if (eventDateStr) {
      const d = new Date(eventDateStr);
      if (Number.isNaN(d.getTime())) {
        return NextResponse.json({ error: 'Invalid eventDate' }, { status: 400 });
      }
      eventDate = d;
    }

    let endDate: Date | null | undefined;
    if (endDateStr === '') {
      endDate = null;
    } else if (endDateStr) {
      const d = new Date(endDateStr);
      if (Number.isNaN(d.getTime())) {
        return NextResponse.json({ error: 'Invalid endDate' }, { status: 400 });
      }
      endDate = d;
    }

    const count = await prisma.event.count();
    const event = await prisma.event.create({
      data: {
        title: title || null,
        eventDate,
        endDate,
        ticketPrice: ticketPrice || 0,
        mediaType,
        mediaUrl,
        notes: notes || null,
        sortOrder: count,
      },
    });
    return NextResponse.json(event);
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Failed to create event';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

