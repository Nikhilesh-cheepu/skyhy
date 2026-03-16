export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextResponse } from 'next/server';
import { getPrisma } from '@/lib/prisma';
import { sendSms } from '@/lib/sms';
import { getCurrentCustomer } from '@/lib/customer-session';

const SLOT_CAPACITY = 10;

export async function POST(request: Request) {
  try {
    const prisma = getPrisma();
    const current = getCurrentCustomer();
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
    const paymentStatus =
      typeof body?.paymentStatus === 'string' && body.paymentStatus
        ? body.paymentStatus
        : 'PENDING';
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

    // Capacity check per date + time slot
    const dayStart = new Date(dateStr);
    const dayEnd = new Date(dateStr);
    dayEnd.setDate(dayEnd.getDate() + 1);

    const existingCount = await prisma.eventBooking.count({
      where: {
        date: {
          gte: dayStart,
          lt: dayEnd,
        },
        time,
      },
    });

    if (existingCount >= SLOT_CAPACITY) {
      return NextResponse.json(
        { error: 'This time slot is fully booked. Please choose another time.' },
        { status: 400 },
      );
    }

    const booking = await prisma.eventBooking.create({
      data: {
        fullName,
        mobile,
        userId: current?.userId,
        date,
        time,
        people,
        ticketPrice: ticketPrice || 0,
        paymentStatus,
        eventId,
      },
    });
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL
      ? process.env.NEXT_PUBLIC_APP_URL
      : process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : "";
    const link = baseUrl ? `${baseUrl}/me` : "My Bookings & Payments";
    void sendSms(
      mobile,
      `SKYHY: Booking confirmed. View details: ${link}. Claim 15% off on À la carte when you pay (FCFS, 30/day).`
    ).catch(() => {});

    return NextResponse.json(booking);
  } catch (e) {
    console.error("[events/book]", e);
    return NextResponse.json(
      { error: "Could not create booking. Please try again." },
      { status: 500 }
    );
  }
}

