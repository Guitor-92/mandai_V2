import type { PrismaClient, Order as PrismaOrder, OrderItem as PrismaOrderItem, Prisma } from '@prisma/client';
import { Order, type OrderItem as DomainOrderItem, type OrderItemModifierSnapshot } from '../domain/entities/order';
import type { OrderRepository } from '../domain/repositories/order.repository';

type FullOrder = PrismaOrder & { items: PrismaOrderItem[] };

export class PrismaOrderRepository implements OrderRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async create(order: Order): Promise<Order> {
    const created = await this.prisma.order.create({
      data: {
        id: order.id,
        code: order.code,
        restaurantId: order.restaurantId,
        couponCode: order.couponCode,
        customerName: order.customerName,
        status: order.status,
        subtotalCents: order.subtotalCents,
        discountCents: order.discountCents,
        totalCents: order.totalCents,
        qrPayload: order.qrPayload,
        estimatedReadyAt: order.estimatedReadyAt,
        createdAt: order.createdAt,
        items: {
          create: order.items.map((item) => ({
            id: item.id,
            menuItemId: item.menuItemId,
            nameSnapshot: item.nameSnapshot,
            priceCentsSnapshot: item.priceCentsSnapshot,
            qty: item.qty,
            modifiers: item.modifiers as unknown as Prisma.InputJsonValue,
            note: item.note,
            lineTotalCents: item.lineTotalCents,
          })),
        },
      },
      include: { items: true },
    });
    return toDomain(created);
  }

  async findByCode(code: string): Promise<Order | null> {
    const row = await this.prisma.order.findUnique({ where: { code }, include: { items: true } });
    return row ? toDomain(row) : null;
  }

  async existsByCode(code: string): Promise<boolean> {
    const count = await this.prisma.order.count({ where: { code } });
    return count > 0;
  }
}

function toDomain(row: FullOrder): Order {
  const items: DomainOrderItem[] = row.items.map((item) => ({
    id: item.id,
    menuItemId: item.menuItemId,
    nameSnapshot: item.nameSnapshot,
    priceCentsSnapshot: item.priceCentsSnapshot,
    qty: item.qty,
    modifiers: item.modifiers as unknown as OrderItemModifierSnapshot[],
    note: item.note,
    lineTotalCents: item.lineTotalCents,
  }));

  return new Order(
    row.id,
    row.code,
    row.restaurantId,
    row.couponCode,
    row.customerName,
    row.status,
    row.subtotalCents,
    row.discountCents,
    row.totalCents,
    row.qrPayload,
    row.estimatedReadyAt,
    row.createdAt,
    items,
  );
}
