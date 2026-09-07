// Tipos do cardápio. Zero imports de Fastify/Prisma — ver ARQUITETURA.md §2.2.
//
// Do lado do cardápio, modificadores carregam regra de negócio (minSelect/
// maxSelect) — é o que POST /api/orders revalida no servidor. Ver docs/erd.md,
// seção "A assimetria cardápio ↔ pedido".

export type MenuItemAvailability = 'AVAILABLE' | 'LOW_STOCK' | 'OUT_OF_STOCK';

export interface ModifierOption {
  id: string;
  name: string;
  priceDeltaCents: number;
  available: boolean;
  position: number;
}

export interface ModifierGroup {
  id: string;
  name: string;
  helperText: string;
  minSelect: number;
  maxSelect: number;
  position: number;
  options: ModifierOption[];
}

export interface MenuItem {
  id: string;
  sectionId: string;
  name: string;
  description: string;
  priceCents: number;
  imageUrl: string;
  availability: MenuItemAvailability;
  isPopular: boolean;
  promoLabel: string | null;
  modifierGroups: ModifierGroup[];
}

export interface MenuSection {
  id: string;
  name: string;
  position: number;
  items: MenuItem[];
}
