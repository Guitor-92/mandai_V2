import { coupons as seedCoupons, type SeedCoupon } from '../../../../prisma/seed-data';
import type { Coupon } from '../domain/entities/coupon';
import type { CouponRepository } from '../domain/repositories/coupon.repository';

export class InMemoryCouponRepository implements CouponRepository {
  async findByCode(code: string): Promise<Coupon | null> {
    const found = seedCoupons.find((c) => c.code === code);
    return found ? toDomain(found) : null;
  }
}

function toDomain(seed: SeedCoupon): Coupon {
  return {
    code: seed.code,
    label: seed.label,
    percentOff: seed.percentOff,
    amountOffCents: seed.amountOffCents,
    minSubtotal: seed.minSubtotal,
    expiresAt: new Date(seed.expiresAt),
    active: seed.active,
  };
}
