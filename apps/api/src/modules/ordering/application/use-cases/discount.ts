import type { Coupon } from '../../domain/entities/coupon';

// Helper compartilhado entre ValidateCouponUseCase e CreateOrderUseCase — os
// dois precisam calcular o mesmo desconto a partir do mesmo cupom, e não faz
// sentido duplicar a regra "percentual OU valor fixo, nunca negativo".
export function computeDiscountCents(coupon: Coupon, subtotalCents: number): number {
  const raw = coupon.percentOff != null
    ? Math.round((subtotalCents * coupon.percentOff) / 100)
    : (coupon.amountOffCents ?? 0);
  return Math.min(raw, subtotalCents);
}
