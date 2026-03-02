export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextResponse } from 'next/server';
import { getPrisma } from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const prisma = getPrisma();
    const { searchParams } = new URL(request.url);
    const sectionId = searchParams.get('sectionId');
    if (!sectionId) {
      const categories = await prisma.category.findMany({
        orderBy: [{ section: { sortOrder: 'asc' } }, { sortOrder: 'asc' }],
        include: { section: { select: { slug: true, name: true } } },
      });
      return NextResponse.json(categories);
    }
    const categories = await prisma.category.findMany({
      where: { sectionId },
      orderBy: { sortOrder: 'asc' },
    });
    return NextResponse.json(categories);
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Failed to fetch categories';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const prisma = getPrisma();
    const body = await request.json();
    const sectionId = typeof body?.sectionId === 'string' ? body.sectionId : '';
    const slug = typeof body?.slug === 'string' ? body.slug.trim().toLowerCase().replace(/\s+/g, '-') : '';
    const name = typeof body?.name === 'string' ? body.name.trim() : slug.replace(/-/g, ' ');
    if (!sectionId || !slug) {
      return NextResponse.json({ error: 'sectionId and slug required' }, { status: 400 });
    }
    const category = await prisma.category.create({
      data: { sectionId, slug, name: name || slug.replace(/-/g, ' '), sortOrder: 0 },
    });
    return NextResponse.json(category);
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Failed to create category';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
