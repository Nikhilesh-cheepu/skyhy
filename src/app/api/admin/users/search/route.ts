export const dynamic = "force-dynamic";
export const revalidate = 0;

import { NextResponse } from "next/server";
import { getPrisma } from "@/lib/prisma";

export async function GET(request: Request) {
  try {
    const prisma = getPrisma();
    const { searchParams } = new URL(request.url);
    const rawQuery = searchParams.get("q") ?? "";

    const digits = rawQuery.replace(/\D/g, "").slice(0, 10);
    if (digits.length < 4) {
      return NextResponse.json({ users: [] });
    }

    const users = await prisma.user.findMany({
      where: {
        phone: {
          contains: digits,
        },
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({
      users: users.map((u) => ({
        id: u.id,
        phone: u.phone,
        createdAt: u.createdAt,
      })),
    });
  } catch (e) {
    const message =
      e instanceof Error ? e.message : "Failed to search users by phone";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

