// Plugin Fastify — recebe os use cases já instanciados (ver ordering.module.ts)
// e expõe os endpoints REST. Validação de payload com zod
// (ARQUITETURA.md §2.2). Contrato completo em docs/qa/contrato-api.md.

import type { FastifyInstance } from 'fastify';
import { z } from 'zod';
import type { OrderingModule } from '../ordering.module';
import type { Restaurant } from '../domain/entities/restaurant';
import type { MenuItem } from '../domain/entities/menu-item';
import type { Order } from '../domain/entities/order';

const listRestaurantsQuerySchema = z.object({
  category: z.string().optional(),
  q: z.string().optional(),
  // DP-05: categoria ordena só por distância (padrão). DP-03: "Mais pedidos
  // no bairro" da Home pede reviewCount desc — ?sort=popular liga esse modo.
  sort: z.enum(['distance', 'popular']).optional(),
});

const slugParamsSchema = z.object({ slug: z.string() });

const searchQuerySchema = z.object({
  q: z.string().min(1, 'Informe um termo de busca.'),
});

const orderItemSchema = z.object({
  menuItemId: z.string(),
  qty: z.number().int().min(1).max(20),
  selectedOptionIds: z.array(z.string()).optional(),
  note: z.string().max(140).optional(),
});

// DP-24: nome obrigatório, mínimo 2 caracteres após trim, máximo 60 — cópia
// de erro exata definida pelo PO.
const customerNameSchema = z
  .string()
  .trim()
  .min(2, 'Escreve seu nome (pelo menos 2 letrinhas) pra gente te chamar no balcão.')
  .max(60, 'Esse nome é grande demais — usa até 60 caracteres.');

const createOrderBodySchema = z.object({
  restaurantSlug: z.string(),
  customerName: customerNameSchema,
  couponCode: z.string().optional(),
  items: z.array(orderItemSchema).min(1, 'A sacola está vazia.'),
});

const codeParamsSchema = z.object({ code: z.string() });

const validateCouponBodySchema = z.object({
  code: z.string().min(1, 'Informe o código do cupom.'),
  subtotalCents: z.number().int().min(0),
});

export function registerOrderingRoutes(app: FastifyInstance, ordering: OrderingModule): void {
  app.get('/api/restaurants', { schema: { querystring: listRestaurantsQuerySchema } }, async (request) => {
    const query = request.query as z.infer<typeof listRestaurantsQuerySchema>;
    const restaurants = await ordering.listRestaurants.execute(query);
    return restaurants.map(toRestaurantSummary);
  });

  app.get('/api/restaurants/:slug', { schema: { params: slugParamsSchema } }, async (request) => {
    const params = request.params as z.infer<typeof slugParamsSchema>;
    const restaurant = await ordering.getRestaurant.execute({ slug: params.slug });
    return toRestaurantDetail(restaurant);
  });

  app.get('/api/search', { schema: { querystring: searchQuerySchema } }, async (request) => {
    const query = request.query as z.infer<typeof searchQuerySchema>;
    const result = await ordering.search.execute({ q: query.q });
    return {
      restaurants: result.restaurants.map(toRestaurantSummary),
      items: result.items.map((hit) => ({
        ...toMenuItem(hit.item),
        restaurantSlug: hit.restaurantSlug,
        restaurantName: hit.restaurantName,
      })),
    };
  });

  app.post('/api/orders', { schema: { body: createOrderBodySchema } }, async (request, reply) => {
    const body = request.body as z.infer<typeof createOrderBodySchema>;
    const { order, restaurant } = await ordering.createOrder.execute(body);
    reply.status(201);
    return toOrderDTO(order, restaurant);
  });

  app.get('/api/orders/:code', { schema: { params: codeParamsSchema } }, async (request) => {
    const params = request.params as z.infer<typeof codeParamsSchema>;
    const { order, restaurant } = await ordering.getOrder.execute({ code: params.code });
    return toOrderDTO(order, restaurant);
  });

  app.post('/api/coupons/validate', { schema: { body: validateCouponBodySchema } }, async (request) => {
    const body = request.body as z.infer<typeof validateCouponBodySchema>;
    return ordering.validateCoupon.execute(body);
  });
}

// ─── DTOs (domínio → JSON da API) ──────────────────────────────────────────
// Fica na camada HTTP de propósito: o domínio não sabe (nem deveria saber)
// qual é o shape exato da resposta JSON.

function toRestaurantSummary(restaurant: Restaurant) {
  return {
    id: restaurant.id,
    slug: restaurant.slug,
    name: restaurant.name,
    category: restaurant.category,
    tags: restaurant.tags,
    rating: restaurant.rating,
    reviewCount: restaurant.reviewCount,
    distanceMeters: restaurant.distanceMeters,
    prepTimeMinutes: restaurant.prepTimeMinutes,
    isOpen: restaurant.isOpen,
    coverUrl: restaurant.coverUrl,
    logoUrl: restaurant.logoUrl,
    neighborhood: restaurant.neighborhood,
    city: restaurant.city,
  };
}

function toRestaurantDetail(restaurant: Restaurant) {
  return {
    ...toRestaurantSummary(restaurant),
    addressLine: restaurant.addressLine,
    phone: restaurant.phone,
    openingHours: restaurant.openingHours,
    // DP-08: seção sem prato nenhum fica oculta — nem no corpo, nem na nav
    // lateral (o frontend monta a nav a partir desta mesma lista).
    sections: restaurant.sections
      .filter((section) => section.items.length > 0)
      .map((section) => ({
        id: section.id,
        name: section.name,
        position: section.position,
        items: section.items.map(toMenuItem),
      })),
  };
}

// Ficha resumida do restaurante embutida na resposta do pedido — P-01
// (docs/qa/respostas-po.md): a tela de confirmação precisa disso na mesma
// resposta de GET /api/orders/:code, sem endpoint extra por id.
function toRestaurantSnapshot(restaurant: Restaurant) {
  return {
    slug: restaurant.slug,
    name: restaurant.name,
    addressLine: restaurant.addressLine,
    neighborhood: restaurant.neighborhood,
    city: restaurant.city,
    phone: restaurant.phone,
    coverUrl: restaurant.coverUrl,
    logoUrl: restaurant.logoUrl,
  };
}

function toMenuItem(item: MenuItem) {
  return {
    id: item.id,
    sectionId: item.sectionId,
    name: item.name,
    description: item.description,
    priceCents: item.priceCents,
    imageUrl: item.imageUrl,
    availability: item.availability,
    isPopular: item.isPopular,
    promoLabel: item.promoLabel,
    modifierGroups: item.modifierGroups,
  };
}

function toOrderDTO(order: Order, restaurant: Restaurant) {
  return {
    id: order.id,
    code: order.code,
    restaurantId: order.restaurantId,
    restaurant: toRestaurantSnapshot(restaurant),
    couponCode: order.couponCode,
    customerName: order.customerName,
    status: order.status,
    subtotalCents: order.subtotalCents,
    discountCents: order.discountCents,
    totalCents: order.totalCents,
    qrPayload: order.qrPayload,
    estimatedReadyAt: order.estimatedReadyAt.toISOString(),
    createdAt: order.createdAt.toISOString(),
    items: order.items,
  };
}
