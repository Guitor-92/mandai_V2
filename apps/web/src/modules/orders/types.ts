// Payload de criação de pedido. O servidor revalida tudo (US-08): existência e
// disponibilidade de cada item, minSelect/maxSelect de cada grupo, restaurante
// aberto, e recalcula subtotal/desconto/total a partir do banco — nunca confia
// no que a sacola do navegador afirma.
export type CreateOrderItemInput = {
  menuItemId: string;
  qty: number;
  selectedOptionIds: string[];
  note?: string;
};

export type CreateOrderInput = {
  restaurantSlug: string;
  customerName: string;
  couponCode?: string;
  items: CreateOrderItemInput[];
};
