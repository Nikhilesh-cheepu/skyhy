import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/menu — Public nested menu: section → categoryKey → items.
 * Used by packages-menu page. Only active items.
 */
export async function GET() {
  try {
    const items = await prisma.menuItem.findMany({
      where: { isActive: true },
      orderBy: [
        { section: { sortOrder: 'asc' } },
        { categoryRef: { sortOrder: 'asc' } },
        { sortOrder: 'asc' },
      ],
      include: {
        section: { select: { slug: true } },
        categoryRef: { select: { slug: true } },
      },
    });

    type Nested = Record<string, Record<string, { id: number; name: string; description: string; price: number; category: string; imageUrl?: string | null }[]>>;
    const nested: Nested = {};

    for (const it of items) {
      const sectionSlug = it.section.slug;
      const categorySlug = it.categoryRef.slug;
      if (!nested[sectionSlug]) nested[sectionSlug] = {};
      if (!nested[sectionSlug][categorySlug]) nested[sectionSlug][categorySlug] = [];
      nested[sectionSlug][categorySlug].push({
        id: it.id,
        name: it.name,
        description: it.description,
        price: it.price,
        category: it.category,
        ...(it.imageUrl && { imageUrl: it.imageUrl }),
      });
    }
    return NextResponse.json(nested);
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Failed to fetch menu';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
