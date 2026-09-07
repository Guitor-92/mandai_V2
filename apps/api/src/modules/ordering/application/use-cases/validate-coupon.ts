import type { CouponRepository } from '../../domain/repositories/coupon.repository';
import { HttpError } from '../../../../shared/errors';
import { computeDiscountCents } from './discount';
import { Money } from '../../domain/value-objects/money';

export interface ValidateCouponInput {
  code: string;
  subtotalCents: number;
}

export interface ValidateCouponOutput {
  code: string;
  label: string;
  discountCents: number;
}

// US-07 (opcional no MVP) — validação isolada, usada pela sacola antes de
// finalizar. POST /api/orders revalida tudo de novo na hora de criar o pedido.
export class ValidateCouponUseCase {
  constructor(private readonly couponRepo: CouponRepository) {}

  async execute(input: ValidateCouponInput): Promise<ValidateCouponOutput> {
    const coupon = await this.couponRepo.findByCode(input.code.toUpperCase());
    if (!coupon) {
      throw new HttpError(404, `Cupom "${input.code}" não existe.`);
    }
    if (!coupon.active) {
      throw new HttpError(400, `Cupom "${coupon.code}" não está mais ativo.`);
    }
    if (coupon.expiresAt.getTime() < Date.now()) {
      throw new HttpError(400, `Cupom "${coupon.code}" expirou.`);
    }
    if (input.subtotalCents < coupon.minSubtotal) {
      const min = new Money(coupon.minSubtotal).format();
      throw new HttpError(400, `Pedido mínimo de ${min} pra usar o cupom "${coupon.code}".`);
    }

    return {
      code: coupon.code,
      label: coupon.label,
      discountCents: computeDiscountCents(coupon, input.subtotalCents),
    };
  }
}
