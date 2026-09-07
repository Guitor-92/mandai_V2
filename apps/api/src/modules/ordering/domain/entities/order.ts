// Entidade Order + linha do pedido. Zero imports de Fastify/Prisma.
//
// OrderItem faz snapshot de nome/preço/modificadores — o pedido é um fato
// histórico, não uma consulta ao cardápio de agora. Ver docs/erd.md.

export type OrderStatus = 'PLACED' | 'READY' | 'PICKED_UP' | 'CANCELED';

export interface OrderItemModifierSnapshot {
  group: string;
  option: string;
  priceDelta: number;
}

export interface OrderItem {
  id: string;
  menuItemId: string | null;
  nameSnapshot: string;
  priceCentsSnapshot: number;
  qty: number;
  modifiers: OrderItemModifierSnapshot[];
  note: string | null;
  lineTotalCents: number;
}

export class Order {
  constructor(
    public readonly id: string,
    public readonly code: string,
    public readonly restaurantId: string,
    public readonly couponCode: string | null,
    public readonly customerName: string,
    public readonly status: OrderStatus,
    public readonly subtotalCents: number,
    public readonly discountCents: number,
    public readonly totalCents: number,
    public readonly qrPayload: string,
    public readonly estimatedReadyAt: Date,
    public readonly createdAt: Date,
    public readonly items: OrderItem[],
  ) {}
}
