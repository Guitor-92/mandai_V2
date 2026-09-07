import type { PrismaClient, Coupon as PrismaCoupon } from '@prisma/client';
import type { Coupon } from '../domain/entities/coupon';
import type { CouponRepository } from '../domain/repositories/coupon.repository';

export class PrismaCouponRepository implements CouponRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findByCode(code: string): Promise<Coupon | null> {
    const row = await this.prisma.coupon.findUnique({ where: { code } });
    return row ? toDomain(row) : null;
  }
}

function toDomain(row: PrismaCoupon): Coupon {
  return {
    code: row.code,
    label: row.label,
    percentOff: row.percentOff,
    amountOffCents: row.amountOffCents,
    minSubtotal: row.minSubtotal,
    expiresAt: row.expiresAt,
    active: row.active,
  };
}
