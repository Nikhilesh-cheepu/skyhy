export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextResponse } from 'next/server';
import { getPrisma } from '@/lib/prisma';

export async function GET() {
  try {
    const prisma = getPrisma();
    const sections = await prisma.section.findMany({
      orderBy: { sortOrder: 'asc' },
      include: { _count: { select: { menuItems: true, categories: true } } },
    });
    return NextResponse.json(sections);
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Failed to fetch sections';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const prisma = getPrisma();
    const body = await request.json();
    const slug = typeof body?.slug === 'string' ? body.slug.trim().toLowerCase().replace(/\s+/g, '-') : '';
    const name = typeof body?.name === 'string' ? body.name.trim() : '';
    if (!slug || !name) {
      return NextResponse.json({ error: 'slug and name required' }, { status: 400 });
    }
    const section = await prisma.section.create({
      data: { slug, name, sortOrder: 0 },
    });
    return NextResponse.json(section);
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Failed to create section';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
