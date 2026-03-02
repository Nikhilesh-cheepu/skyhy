export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  try {
    const [sections, categories, menuItems] = await Promise.all([
      prisma.section.count(),
      prisma.category.count(),
      prisma.menuItem.count(),
    ]);
    return NextResponse.json({ sections, categories, menuItems });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Failed to fetch stats';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
