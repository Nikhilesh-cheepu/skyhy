import { getPrisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

function getTodayDayKeyIST(): string {
  const now = new Date();
  // Convert to IST (+5:30) by shifting milliseconds; sufficient for daily key
  const istOffsetMs = 5.5 * 60 * 60 * 1000;
  const ist = new Date(now.getTime() + istOffsetMs);
  return ist.toISOString().slice(0, 10); // YYYY-MM-DD
}

export async function allocateDailyCouponForPhone(phone: string) {
  const clean = phone.replace(/\D/g, "").slice(-10);
  if (clean.length !== 10) {
    return { allocated: false, reason: "invalid-phone" } as const;
  }

  const prisma = getPrisma();
  const dayKey = getTodayDayKeyIST();

  try {
    const result = await prisma.$transaction(async (tx) => {
      const user = await tx.user.findUnique({
        where: { phone: clean },
      });
      if (!user) {
        return { allocated: false, reason: "no-user" } as const;
      }

      const existing = await tx.coupon.findFirst({
        where: { userId: user.id, dayKey },
      });
      if (existing) {
        return { allocated: false, reason: "already-has-today" } as const;
      }

      const issuedCount = await tx.coupon.count({
        where: {
          dayKey,
          status: { in: ["ACTIVE", "USED"] },
        },
      });

      if (issuedCount >= 30) {
        return { allocated: false, reason: "quota-full" } as const;
      }

      const coupon = await tx.coupon.create({
        data: {
          // code is unique, generate simple opaque code
          code: `DAY${dayKey.replace(/-/g, "")}-${Math.random()
            .toString(36)
            .slice(2, 8)
            .toUpperCase()}`,
          userId: user.id,
          status: "ACTIVE",
          dayKey,
          discountPercent: 25,
        },
      });

      return { allocated: true, coupon } as const;
    });

    return result;
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      // Unique constraint might fire in rare race; treat as no allocation
      if (e.code === "P2002") {
        return { allocated: false, reason: "unique-conflict" } as const;
      }
    }
    return { allocated: false, reason: "error" } as const;
  }
}

