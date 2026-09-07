import type { Order } from '../domain/entities/order';
import type { OrderRepository } from '../domain/repositories/order.repository';

// Persistência em memória (Map por código) — os pedidos duram enquanto o
// processo do servidor estiver de pé. É o suficiente pra rodar a demo sem
// banco (ver docs/qa/00-briefing-do-lead.md, seção D).
const store = new Map<string, Order>();

export class InMemoryOrderRepository implements OrderRepository {
  async create(order: Order): Promise<Order> {
    store.set(order.code, order);
    return order;
  }

  async findByCode(code: string): Promise<Order | null> {
    return store.get(code) ?? null;
  }

  async existsByCode(code: string): Promise<boolean> {
    return store.has(code);
  }
}
