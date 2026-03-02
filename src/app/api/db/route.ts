export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

/**
 * GET /api/db — Verify database connection and return schema/migration status.
 * Safe to call from browser or curl; no sensitive data returned.
 */
export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`;
    const [sections, categories, menuItems, galleryImages, heroMedia] = await Promise.all([
      prisma.section.count(),
      prisma.category.count(),
      prisma.menuItem.count(),
      prisma.galleryImage.count(),
      prisma.heroMedia.count(),
    ]);
    return NextResponse.json({
      ok: true,
      database: 'connected',
      schema: {
        Section: sections,
        Category: categories,
        MenuItem: menuItems,
        GalleryImage: galleryImages,
        HeroMedia: heroMedia,
      },
    });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Unknown error';
    return NextResponse.json(
      { ok: false, database: 'error', error: message },
      { status: 500 }
    );
  }
}
