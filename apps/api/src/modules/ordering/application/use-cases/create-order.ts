import { randomUUID } from 'node:crypto';
import type { RestaurantRepository } from '../../domain/repositories/restaurant.repository';
import type { OrderRepository } from '../../domain/repositories/order.repository';
import type { CouponRepository } from '../../domain/repositories/coupon.repository';
import { Order, type OrderItem, type OrderItemModifierSnapshot } from '../../domain/entities/order';
import { Money } from '../../domain/value-objects/money';
import { HttpError } from '../../../../shared/errors';
import { generateOrderCode } from './order-code';
import { computeDiscountCents } from './discount';
import type { OrderWithRestaurant } from './get-order';

export interface CreateOrderItemInput {
  menuItemId: string;
  qty: number;
  selectedOptionIds?: string[];
  note?: string | null;
}

export interface CreateOrderInput {
  restaurantSlug: string;
  customerName: string;
  couponCode?: string | null;
  items: CreateOrderItemInput[];
}

const MAX_CODE_ATTEMPTS = 5;

// US-08 — cria o pedido e devolve o código MA-XXXX + QR pra tela de
// confirmação. Revalida TUDO no servidor (ARQUITETURA.md §9, docs/qa/00-briefing):
// existência e disponibilidade de cada item, minSelect/maxSelect de cada grupo,
// restaurante aberto, e recalcula subtotal/desconto/total a partir do banco.
// Nunca confia nos totais que vierem no payload.
export class CreateOrderUseCase {
  constructor(
    private readonly orderRepo: OrderRepository,
    private readonly restaurantRepo: RestaurantRepository,
    private readonly couponRepo: CouponRepository,
  ) {}

  async execute(input: CreateOrderInput): Promise<OrderWithRestaurant> {
    // DP-24: nome obrigatório, mínimo 2 caracteres após trim, máximo 60. O
    // zod de POST /api/orders já barra isso na borda HTTP — esta checagem é
    // a mesma regra reaplicada aqui, pra valer também se o use case for
    // chamado direto (ex.: testes), sem depender só da validação de borda.
    const customerName = (input.customerName ?? '').trim();
    if (customerName.length < 2 || customerName.length > 60) {
      throw new HttpError(400, 'Escreve seu nome (pelo menos 2 letrinhas) pra gente te chamar no balcão.');
    }

    if (!input.items || input.items.length === 0) {
      throw new HttpError(400, 'A sacola está vazia.');
    }

    const restaurant = await this.restaurantRepo.findBySlug(input.restaurantSlug);
    if (!restaurant) {
      throw new HttpError(404, `Restaurante "${input.restaurantSlug}" não encontrado.`);
    }
    if (!restaurant.isOpen) {
      throw new HttpError(400, `${restaurant.name} está fechado agora. Não dá pra confirmar o pedido.`);
    }

    const orderItems: OrderItem[] = [];
    let subtotalCents = 0;

    for (const requested of input.items) {
      if (!Number.isInteger(requested.qty) || requested.qty < 1 || requested.qty > 20) {
        throw new HttpError(400, `Quantidade inválida para o item "${requested.menuItemId}" (1 a 20).`);
      }

      const menuItem = restaurant.findMenuItem(requested.menuItemId);
      if (!menuItem) {
        throw new HttpError(400, `Item "${requested.menuItemId}" não encontrado no cardápio de ${restaurant.name}.`);
      }
      if (menuItem.availability === 'OUT_OF_STOCK') {
        throw new HttpError(400, `"${menuItem.name}" está esgotado agora.`);
      }

      const selectedOptionIds = requested.selectedOptionIds ?? [];
      const allOptionIds = new Set(
        menuItem.modifierGroups.flatMap((group) => group.options.map((option) => option.id)),
      );
      for (const optionId of selectedOptionIds) {
        if (!allOptionIds.has(optionId)) {
          throw new HttpError(400, `Opção "${optionId}" não existe em "${menuItem.name}".`);
        }
      }

      const modifiers: OrderItemModifierSnapshot[] = [];
      let modifiersDeltaCents = 0;

      for (const group of menuItem.modifierGroups) {
        const selected = group.options.filter((option) => selectedOptionIds.includes(option.id));

        if (selected.length < group.minSelect || selected.length > group.maxSelect) {
          throw new HttpError(
            400,
            `"${group.name}" em "${menuItem.name}" exige entre ${group.minSelect} e ${group.maxSelect} escolha(s) — você enviou ${selected.length}.`,
          );
        }

        for (const option of selected) {
          if (!option.available) {
            throw new HttpError(400, `A opção "${option.name}" de "${group.name}" está esgotada.`);
          }
          modifiers.push({ group: group.name, option: option.name, priceDelta: option.priceDeltaCents });
          modifiersDeltaCents += option.priceDeltaCents;
        }
      }

      const unitPriceCents = new Money(menuItem.priceCents).add(new Money(modifiersDeltaCents)).value;
      const lineTotalCents = new Money(unitPriceCents).multiply(requested.qty).value;
      subtotalCents += lineTotalCents;

      orderItems.push({
        id: randomUUID(),
        menuItemId: menuItem.id,
        nameSnapshot: menuItem.name,
        priceCentsSnapshot: menuItem.priceCents,
        qty: requested.qty,
        modifiers,
        note: requested.note?.slice(0, 140) ?? null,
        lineTotalCents,
      });
    }

    let discountCents = 0;
    let couponCode: string | null = null;
    if (input.couponCode) {
      const code = input.couponCode.trim().toUpperCase();
      const coupon = await this.couponRepo.findByCode(code);
      if (!coupon) {
        throw new HttpError(404, `Cupom "${code}" não existe.`);
      }
      if (!coupon.active) {
        throw new HttpError(400, `Cupom "${coupon.code}" não está mais ativo.`);
      }
      if (coupon.expiresAt.getTime() < Date.now()) {
        throw new HttpError(400, `Cupom "${coupon.code}" expirou.`);
      }
      if (subtotalCents < coupon.minSubtotal) {
        const min = new Money(coupon.minSubtotal).format();
        throw new HttpError(400, `Pedido mínimo de ${min} pra usar o cupom "${coupon.code}".`);
      }
      discountCents = computeDiscountCents(coupon, subtotalCents);
      couponCode = coupon.code;
    }

    const totalCents = new Money(subtotalCents).subtract(new Money(discountCents)).value;

    const id = randomUUID();
    const code = await this.generateUniqueCode();
    const createdAt = new Date();
    const estimatedReadyAt = new Date(createdAt.getTime() + restaurant.prepTimeMinutes * 60_000);
    // DP-16 / ADR-0013: URL determinística, sem assinatura criptográfica de
    // verdade — e aponta pra própria tela de confirmação (rota fixada pelo
    // ADR-0009), não pra um encurtador que não existe.
    const qrPayload = `https://mandai.app/pedido/${code}`;

    const order = new Order(
      id,
      code,
      restaurant.id,
      couponCode,
      customerName,
      'PLACED',
      subtotalCents,
      discountCents,
      totalCents,
      qrPayload,
      estimatedReadyAt,
      createdAt,
      orderItems,
    );

    const createdOrder = await this.orderRepo.create(order);
    return { order: createdOrder, restaurant };
  }

  private async generateUniqueCode(): Promise<string> {
    for (let attempt = 0; attempt < MAX_CODE_ATTEMPTS; attempt++) {
      const code = generateOrderCode();
      if (!(await this.orderRepo.existsByCode(code))) {
        return code;
      }
    }
    throw new HttpError(500, 'Não foi possível gerar um código de pedido único. Tenta de novo.');
  }
}
