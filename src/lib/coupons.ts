import { getPrisma } from "@/lib/prisma";
import { Prisma } from "@prisma/client";

type AllocationReason =
  | "invalid-phone"
  | "no-user"
  | "already-has-day"
  | "quota-full"
  | "unique-conflict"
  | "error";

function getDayKeyFromReservationIST(reservationDate: Date): string {
  const istOffsetMs = 5.5 * 60 * 60 * 1000;
  const ist = new Date(reservationDate.getTime() + istOffsetMs);
  return ist.toISOString().slice(0, 10); // YYYY-MM-DD based on IST day
}

function getEndOfDayIST(reservationDate: Date): Date {
  const istOffsetMs = 5.5 * 60 * 60 * 1000;
  const ist = new Date(reservationDate.getTime() + istOffsetMs);
  // Set to 23:59:59.999 in IST-equivalent, then shift back to UTC
  ist.setUTCHours(23, 59, 59, 999);
  return new Date(ist.getTime() - istOffsetMs);
}

async function allocateDailyCouponForUserAndDay(opts: {
  userId: string;
  reservationDate: Date;
  reservationId?: string;
}) {
  const prisma = getPrisma();
  const { userId, reservationDate, reservationId } = opts;
  const dayKey = getDayKeyFromReservationIST(reservationDate);
  const expiresAt = getEndOfDayIST(reservationDate);

  try {
    const result = await prisma.$transaction(async (tx) => {
      const existing = await tx.coupon.findFirst({
        where: { userId, dayKey },
      });
      if (existing) {
        return { allocated: false, reason: "already-has-day" as AllocationReason };
      }

      const dayRow = await tx.couponDay.upsert({
        where: { dayKey },
        create: { dayKey, issuedCount: 0 },
        update: {},
      });

      if (dayRow.issuedCount >= 30) {
        return { allocated: false, reason: "quota-full" as AllocationReason };
      }

      const code = `DAY${dayKey.replace(/-/g, "")}-${Math.random()
        .toString(36)
        .slice(2, 8)
        .toUpperCase()}`;

      const coupon = await tx.coupon.create({
        data: {
          code,
          userId,
          status: "ACTIVE",
          dayKey,
          discountPercent: 15,
          issuedAt: new Date(),
          expiresAt,
          reservationId,
        },
      });

      await tx.couponDay.update({
        where: { dayKey },
        data: { issuedCount: { increment: 1 } },
      });

      return { allocated: true as const, coupon };
    });

    return result;
  } catch (e) {
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      if (e.code === "P2002") {
        return { allocated: false, reason: "unique-conflict" as AllocationReason };
      }
    }
    return { allocated: false, reason: "error" as AllocationReason };
  }
}

export async function allocateDailyCouponForPhone(
  phone: string,
  opts: { reservationDate: Date; reservationId?: string }
) {
  const clean = phone.replace(/\D/g, "").slice(-10);
  if (clean.length !== 10) {
    return { allocated: false, reason: "invalid-phone" as AllocationReason };
  }

  const prisma = getPrisma();

  const user = await prisma.user.findUnique({
    where: { phone: clean },
  });
  if (!user) {
    return { allocated: false, reason: "no-user" as AllocationReason };
  }

  return allocateDailyCouponForUserAndDay({
    userId: user.id,
    reservationDate: opts.reservationDate,
    reservationId: opts.reservationId,
  });
}

