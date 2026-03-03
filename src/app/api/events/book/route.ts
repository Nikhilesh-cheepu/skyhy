export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextResponse } from 'next/server';
import { getPrisma } from '@/lib/prisma';
import { allocateDailyCouponForPhone } from '@/lib/coupons';
import { sendSms } from '@/lib/sms';

export async function POST(request: Request) {
  try {
    const prisma = getPrisma();
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

    const booking = await prisma.eventBooking.create({
      data: {
        fullName,
        mobile,
        date,
        time,
        people,
        ticketPrice: ticketPrice || 0,
        paymentStatus,
        eventId,
      },
    });
    const couponResult = await allocateDailyCouponForPhone(mobile);

    const baseUrl = process.env.NEXT_PUBLIC_APP_URL
      ? process.env.NEXT_PUBLIC_APP_URL
      : process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}`
        : "";
    const link = baseUrl ? `${baseUrl}/account` : "your account";
    void sendSms(mobile, `SKYHY: Booking confirmed. View details: ${link}`).catch(() => {});

    return NextResponse.json({
      ...booking,
      couponAllocated: couponResult.allocated,
    });
  } catch (e) {
    console.error("[events/book]", e);
    return NextResponse.json(
      { error: "Could not create booking. Please try again." },
      { status: 500 }
    );
  }
}

