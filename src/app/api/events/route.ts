export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextResponse } from 'next/server';
import { getPrisma } from '@/lib/prisma';

export async function GET() {
  try {
    const prisma = getPrisma();
    const events = await prisma.event.findMany({
      where: {
        isActive: true,
        OR: [
          { endDate: null },
          { endDate: { gte: new Date() } },
        ],
      },
      orderBy: [{ sortOrder: 'asc' }, { eventDate: 'asc' }],
    });
    return NextResponse.json(events);
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Failed to fetch events';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

