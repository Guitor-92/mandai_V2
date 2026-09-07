"use client";

// DP-12: "Pedidos recentes" na sacola vazia é histórico local (sem cadastro).
// Se a lista estiver vazia, a seção inteira some da tela — nunca aparece com
// placeholder.

const STORAGE_KEY = "mandai:recent-orders";
const MAX_ITEMS = 5;

export type RecentOrder = {
  code: string;
  restaurantSlug: string;
  restaurantName: string;
  createdAt: string;
};

export function getRecentOrders(): RecentOrder[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as RecentOrder[]) : [];
  } catch {
    return [];
  }
}

export function pushRecentOrder(order: RecentOrder): void {
  try {
    const current = getRecentOrders().filter((o) => o.code !== order.code);
    const next = [order, ...current].slice(0, MAX_ITEMS);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // localStorage indisponível — histórico só não persiste.
  }
}
