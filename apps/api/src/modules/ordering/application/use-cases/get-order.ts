import type { OrderRepository } from '../../domain/repositories/order.repository';
import type { RestaurantRepository } from '../../domain/repositories/restaurant.repository';
import type { Order } from '../../domain/entities/order';
import type { Restaurant } from '../../domain/entities/restaurant';
import { HttpError } from '../../../../shared/errors';

export interface OrderWithRestaurant {
  order: Order;
  restaurant: Restaurant;
}

// US-08 — a tela de confirmação lê o pedido pelo código MA-XXXX. Precisa,
// junto do pedido, da ficha do restaurante (nome, logo, endereço, telefone) —
// docs/qa/respostas-po.md, P-01 — por isso o restaurantRepo entra aqui
// também, do mesmo jeito que já entra em CreateOrderUseCase.
export class GetOrderUseCase {
  constructor(
    private readonly orderRepo: OrderRepository,
    private readonly restaurantRepo: RestaurantRepository,
  ) {}

  async execute(input: { code: string }): Promise<OrderWithRestaurant> {
    const order = await this.orderRepo.findByCode(input.code);
    if (!order) {
      throw new HttpError(404, `Pedido "${input.code}" não encontrado.`);
    }

    const restaurant = await this.restaurantRepo.findById(order.restaurantId);
    if (!restaurant) {
      // Não deveria acontecer (FK garante a relação), mas um pedido sem
      // restaurante pra mostrar não serve pra tela de confirmação.
      throw new HttpError(404, `Restaurante do pedido "${input.code}" não encontrado.`);
    }

    return { order, restaurant };
  }
}
