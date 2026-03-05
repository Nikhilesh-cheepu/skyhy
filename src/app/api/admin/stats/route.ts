export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextResponse } from 'next/server';
import { getPrisma } from '@/lib/prisma';
import { ensureBillSchema } from '@/lib/ensure-bill-schema';

export async function GET() {
  try {
    const prisma = getPrisma();
    await ensureBillSchema(prisma);

    const [sections, categories, menuItems, galleryImages] = await Promise.all([
      prisma.section.count(),
      prisma.category.count(),
      prisma.menuItem.count(),
      prisma.menuGalleryImage.count(),
    ]);

    const [totalBills, paidBills, pendingBills, billAmounts] = await Promise.all([
      prisma.bill.count(),
      prisma.bill.count({ where: { status: 'PAID' } }),
      prisma.bill.count({ where: { status: 'PENDING' } }),
      prisma.bill.aggregate({
        _sum: { amount: true },
      }),
    ]);

    const [activeEvents, totalBookings, pendingBookings] = await Promise.all([
      prisma.event.count({ where: { isActive: true } }),
      prisma.eventBooking.count(),
      prisma.eventBooking.count({ where: { paymentStatus: { not: 'PAID' } } }),
    ]);

    const eventBookings = await prisma.eventBooking.findMany({
      select: { people: true, ticketPrice: true, paymentStatus: true },
    });
    const totalBookingRevenue = eventBookings.reduce((sum, b) => {
      const value = (b.ticketPrice ?? 0) * b.people;
      return sum + (b.paymentStatus === 'PAID' ? value : 0);
    }, 0);

    let whatsappClicks = 0;
    let callClicks = 0;
    try {
      const [w, c] = await Promise.all([
        prisma.contactClick.count({ where: { type: 'whatsapp' } }),
        prisma.contactClick.count({ where: { type: 'call' } }),
      ]);
      whatsappClicks = w;
      callClicks = c;
    } catch (clickErr) {
      // Older databases may not have the ContactClick table yet.
      console.error('[admin/stats contactClick]', clickErr);
    }

    return NextResponse.json({
      sections,
      categories,
      menuItems,
      galleryImages,
      totalBills,
      paidBills,
      pendingBills,
      totalBillAmount: billAmounts._sum.amount ?? 0,
      activeEvents,
      totalBookings,
      pendingBookings,
      totalBookingRevenue,
      whatsappClicks,
      callClicks,
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Failed to fetch stats';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
