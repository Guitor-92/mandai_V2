export type CartItemModifier = {
  groupId: string;
  groupName: string;
  optionId: string;
  optionName: string;
  priceDeltaCents: number;
};

export type CartItem = {
  lineId: string;
  menuItemId: string;
  name: string;
  imageUrl: string;
  unitPriceCents: number;
  qty: number;
  modifiers: CartItemModifier[];
  note?: string;
};

export type Cart = {
  restaurantSlug: string | null;
  restaurantName: string | null;
  items: CartItem[];
  couponCode?: string;
};

export type AddItemInput = {
  restaurantSlug: string;
  restaurantName: string;
  menuItemId: string;
  name: string;
  imageUrl: string;
  unitPriceCents: number;
  qty: number;
  modifiers: CartItemModifier[];
  note?: string;
};

export function lineUnitTotalCents(item: Pick<CartItem, "unitPriceCents" | "modifiers">): number {
  return item.unitPriceCents + item.modifiers.reduce((sum, m) => sum + m.priceDeltaCents, 0);
}

export function lineTotalCents(item: CartItem): number {
  return lineUnitTotalCents(item) * item.qty;
}

export function cartSubtotalCents(cart: Cart): number {
  return cart.items.reduce((sum, item) => sum + lineTotalCents(item), 0);
}

export function cartItemCount(cart: Cart): number {
  return cart.items.reduce((sum, item) => sum + item.qty, 0);
}
