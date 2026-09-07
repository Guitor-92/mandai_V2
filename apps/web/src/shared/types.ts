// Tipos espelhando a API real de `apps/api` (ver `ordering.routes.ts`, DTOs no
// fim do arquivo) — que por sua vez espelha `docs/erd.md`. Dinheiro sempre em
// centavos inteiros. A API nunca devolve string formatada — formatação é do
// frontend (ver `shared/lib/money.ts`).

export type Availability = "AVAILABLE" | "LOW_STOCK" | "OUT_OF_STOCK";

export type OrderStatus = "PLACED" | "READY" | "PICKED_UP" | "CANCELED";

export type OpeningHour = {
  dayOfWeek: number; // 0=domingo .. 6=sábado
  opensAtMinutes: number;
  closesAtMinutes: number;
};

export type ModifierOption = {
  id: string;
  name: string;
  priceDeltaCents: number; // centavos, 0 = grátis
  available: boolean;
  position: number;
};

export type ModifierGroup = {
  id: string;
  name: string;
  helperText: string;
  minSelect: number; // 1+ = obrigatório
  maxSelect: number; // 1 = escolha única, >1 = múltipla
  position: number;
  options: ModifierOption[];
};

export type MenuItem = {
  id: string;
  sectionId: string;
  name: string;
  description: string;
  priceCents: number;
  imageUrl: string;
  availability: Availability;
  isPopular: boolean;
  promoLabel: string | null;
  modifierGroups: ModifierGroup[];
};

export type MenuSection = {
  id: string;
  name: string;
  position: number;
  items: MenuItem[];
};

// GET /api/restaurants — resumo, sem endereço/telefone/cardápio.
export type Restaurant = {
  id: string;
  slug: string;
  name: string;
  category: string;
  tags: string;
  rating: number;
  reviewCount: number;
  distanceMeters: number;
  prepTimeMinutes: number;
  isOpen: boolean;
  coverUrl: string;
  logoUrl: string;
  neighborhood: string;
  city: string;
};

// GET /api/restaurants/:slug — o resumo mais endereço/telefone e o cardápio inteiro.
export type RestaurantDetail = Restaurant & {
  addressLine: string;
  phone: string;
  openingHours: OpeningHour[];
  sections: MenuSection[];
};

export type SearchMenuItemHit = MenuItem & {
  restaurantSlug: string;
  restaurantName: string;
};

export type SearchResult = {
  restaurants: Restaurant[];
  items: SearchMenuItemHit[];
};

export type OrderItemModifierSnapshot = {
  group: string;
  option: string;
  priceDelta: number;
};

export type OrderItem = {
  id: string;
  menuItemId: string | null;
  nameSnapshot: string;
  priceCentsSnapshot: number;
  qty: number;
  modifiers: OrderItemModifierSnapshot[];
  note: string | null;
  lineTotalCents: number;
};

// Ficha do restaurante embutida no pedido (não é snapshot congelado — é o
// dado atual do restaurante; só `items[]` é congelado por linha).
export type OrderRestaurantSnapshot = {
  slug: string;
  name: string;
  addressLine: string;
  neighborhood: string;
  city: string;
  phone: string;
  coverUrl: string;
  logoUrl: string;
};

export type Order = {
  id: string;
  code: string;
  restaurantId: string;
  restaurant: OrderRestaurantSnapshot;
  couponCode: string | null;
  customerName: string;
  status: OrderStatus;
  subtotalCents: number;
  discountCents: number;
  totalCents: number;
  qrPayload: string;
  estimatedReadyAt: string;
  createdAt: string;
  items: OrderItem[];
};

// POST /api/coupons/validate: 200 = válido (o corpo abaixo); inválido/expirado/
// abaixo do mínimo/inexistente vira erro HTTP (ApiError), não um campo `valid`.
export type CouponValidation = {
  code: string;
  label: string;
  discountCents: number;
};

export type ApiErrorBody = {
  statusCode: number;
  error: string;
  message: string;
};
