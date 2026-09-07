// Entidade Restaurant. Zero imports de Fastify/Prisma.

import type { MenuItem, MenuSection } from './menu-item';

export interface OpeningHour {
  dayOfWeek: number; // 0=domingo .. 6=sábado
  opensAtMinutes: number;
  closesAtMinutes: number;
}

export class Restaurant {
  constructor(
    public readonly id: string,
    public readonly slug: string,
    public readonly name: string,
    public readonly category: string,
    public readonly tags: string,
    public readonly rating: number,
    public readonly reviewCount: number,
    public readonly distanceMeters: number,
    public readonly prepTimeMinutes: number,
    public readonly isOpen: boolean,
    public readonly coverUrl: string,
    public readonly logoUrl: string,
    public readonly addressLine: string,
    public readonly neighborhood: string,
    public readonly city: string,
    public readonly phone: string,
    // Populados apenas na consulta de detalhe (getRestaurant) — a listagem
    // não precisa do cardápio inteiro. Ver ordering.module.ts.
    public readonly openingHours: OpeningHour[] = [],
    public readonly sections: MenuSection[] = [],
  ) {}

  findMenuItem(menuItemId: string): MenuItem | undefined {
    for (const section of this.sections) {
      const item = section.items.find((candidate) => candidate.id === menuItemId);
      if (item) return item;
    }
    return undefined;
  }
}
