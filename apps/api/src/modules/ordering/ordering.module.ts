// Factory de DI manual — sem decorators, sem container. É aqui que se decide
// qual implementação de repositório entra: Prisma (com DATABASE_URL) ou em
// memória (sem banco). O use case não sabe qual das duas está recebendo —
// é a demonstração central de "interface no domínio, implementação na infra"
// (docs/qa/00-briefing-do-lead.md, seção D).

import type { PrismaClient } from '@prisma/client';
import type { RestaurantRepository } from './domain/repositories/restaurant.repository';
import type { OrderRepository } from './domain/repositories/order.repository';
import type { CouponRepository } from './domain/repositories/coupon.repository';

import { PrismaRestaurantRepository } from './infra/prisma-restaurant.repository';
import { PrismaOrderRepository } from './infra/prisma-order.repository';
import { PrismaCouponRepository } from './infra/prisma-coupon.repository';
import { InMemoryRestaurantRepository } from './infra/in-memory-restaurant.repository';
import { InMemoryOrderRepository } from './infra/in-memory-order.repository';
import { InMemoryCouponRepository } from './infra/in-memory-coupon.repository';

import { ListRestaurantsUseCase } from './application/use-cases/list-restaurants';
import { GetRestaurantUseCase } from './application/use-cases/get-restaurant';
import { SearchUseCase } from './application/use-cases/search';
import { CreateOrderUseCase } from './application/use-cases/create-order';
import { GetOrderUseCase } from './application/use-cases/get-order';
import { ValidateCouponUseCase } from './application/use-cases/validate-coupon';

export function buildOrderingModule(prisma: PrismaClient | null) {
  const usingDatabase = prisma !== null;

  const restaurantRepo: RestaurantRepository = usingDatabase
    ? new PrismaRestaurantRepository(prisma)
    : new InMemoryRestaurantRepository();

  const orderRepo: OrderRepository = usingDatabase
    ? new PrismaOrderRepository(prisma)
    : new InMemoryOrderRepository();

  const couponRepo: CouponRepository = usingDatabase
    ? new PrismaCouponRepository(prisma)
    : new InMemoryCouponRepository();

  return {
    usingDatabase,
    listRestaurants: new ListRestaurantsUseCase(restaurantRepo),
    getRestaurant: new GetRestaurantUseCase(restaurantRepo),
    search: new SearchUseCase(restaurantRepo),
    createOrder: new CreateOrderUseCase(orderRepo, restaurantRepo, couponRepo),
    getOrder: new GetOrderUseCase(orderRepo, restaurantRepo),
    validateCoupon: new ValidateCouponUseCase(couponRepo),
  };
}

export type OrderingModule = ReturnType<typeof buildOrderingModule>;
