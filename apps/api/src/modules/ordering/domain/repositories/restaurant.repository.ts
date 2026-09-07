// Interface do repositório — "a interface mora no domínio, a implementação
// mora na infra". Duas implementações trocáveis: infra/prisma-restaurant.repository.ts
// e infra/in-memory-restaurant.repository.ts (ver ordering.module.ts).

import type { Restaurant } from '../entities/restaurant';
import type { MenuItem } from '../entities/menu-item';

export interface RestaurantFilter {
  category?: string;
  q?: string;
  /**
   * "distance" (padrão) = distanceMeters asc — DP-05, único critério da
   * categoria. "popular" = reviewCount desc — DP-03, seção "Mais pedidos no
   * bairro" da Home. Ver docs/decisoes-produto.md.
   */
  sort?: 'distance' | 'popular';
}

export interface SearchItemHit {
  item: MenuItem;
  restaurantSlug: string;
  restaurantName: string;
}

export interface SearchResult {
  restaurants: Restaurant[];
  items: SearchItemHit[];
}

export interface RestaurantRepository {
  /** Listagem leve (Home/categoria) — sem sections/openingHours. */
  findAll(filter?: RestaurantFilter): Promise<Restaurant[]>;
  /** Detalhe completo (cardápio) — com sections/openingHours. */
  findBySlug(slug: string): Promise<Restaurant | null>;
  findById(id: string): Promise<Restaurant | null>;
  search(q: string): Promise<SearchResult>;
}
