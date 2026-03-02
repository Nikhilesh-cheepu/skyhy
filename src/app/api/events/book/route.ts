export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const fullName = typeof body?.fullName === 'string' ? body.fullName.trim() : '';
    const mobile = typeof body?.mobile === 'string' ? body.mobile.trim() : '';
    const dateStr = typeof body?.date === 'string' ? body.date : '';
    const time = typeof body?.time === 'string' ? body.time : '';
    const people =
      typeof body?.people === 'number'
        ? body.people
        : body?.people != null
        ? Number(body.people)
        : NaN;
    const ticketPrice =
      typeof body?.ticketPrice === 'number'
        ? body.ticketPrice
        : body?.ticketPrice != null
        ? Number(body.ticketPrice)
        : 0;
    const eventId = typeof body?.eventId === 'string' ? body.eventId : undefined;

    if (!fullName || !mobile || !dateStr || !time || !Number.isFinite(people) || people <= 0) {
      return NextResponse.json(
        { error: 'fullName, mobile, date, time and people are required' },
        { status: 400 },
      );
    }

    const date = new Date(dateStr);
    if (Number.isNaN(date.getTime())) {
      return NextResponse.json({ error: 'Invalid date' }, { status: 400 });
    }

    const booking = await prisma.eventBooking.create({
      data: {
        fullName,
        mobile,
        date,
        time,
        people,
        ticketPrice: ticketPrice || 0,
        eventId,
      },
    });

    return NextResponse.json(booking);
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Failed to create booking';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

