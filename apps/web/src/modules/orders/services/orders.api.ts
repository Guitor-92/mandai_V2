import { apiFetch } from "@/shared/lib/api";
import type { Order } from "@/shared/types";
import type { CreateOrderInput } from "@/modules/orders/types";

export function createOrder(input: CreateOrderInput): Promise<Order> {
  return apiFetch<Order>("/api/orders", {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export function getOrderByCode(code: string): Promise<Order> {
  return apiFetch<Order>(`/api/orders/${code}`);
}
