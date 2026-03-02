export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextResponse } from 'next/server';
import { getPrisma } from '@/lib/prisma';

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const prisma = getPrisma();
    const { id } = await params;
    const count = await prisma.menuItem.count({ where: { categoryId: id } });
    if (count > 0) {
      return NextResponse.json(
        { error: 'Cannot delete category with menu items' },
        { status: 400 }
      );
    }
    await prisma.category.delete({ where: { id } });
    return NextResponse.json({ ok: true });
  } catch (e) {
    const message = e instanceof Error ? e.message : 'Failed to delete category';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
