import type { Order } from '../entities/order';

export interface OrderRepository {
  create(order: Order): Promise<Order>;
  findByCode(code: string): Promise<Order | null>;
  existsByCode(code: string): Promise<boolean>;
}
