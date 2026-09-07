import type { Coupon } from '../entities/coupon';

export interface CouponRepository {
  findByCode(code: string): Promise<Coupon | null>;
}
