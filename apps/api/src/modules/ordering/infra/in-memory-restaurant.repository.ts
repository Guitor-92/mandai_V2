// Implementação em memória — usada quando não há DATABASE_URL (ver
// ordering.module.ts e docs/qa/00-briefing-do-lead.md, seção D). Lê a MESMA
// fonte de dados que o seed do Postgres (prisma/seed-data.ts), então não há
// dado duplicado a manter entre as duas implementações.

import { restaurants as seedRestaurants, type SeedRestaurant } from '../../../../prisma/seed-data';
import { Restaurant } from '../domain/entities/restaurant';
import type { MenuItem, MenuSection, ModifierGroup, ModifierOption } from '../domain/entities/menu-item';
import type {
  RestaurantRepository,
  RestaurantFilter,
  SearchResult,
  SearchItemHit,
} from '../domain/repositories/restaurant.repository';

type SeedMenuItem = SeedRestaurant['sections'][number]['items'][number];

export class InMemoryRestaurantRepository implements RestaurantRepository {
  async findAll(filter: RestaurantFilter = {}): Promise<Restaurant[]> {
    let list = seedRestaurants;
    if (filter.category) {
      list = list.filter((r) => r.category === filter.category);
    }
    if (filter.q) {
      const q = filter.q.toLowerCase();
      list = list.filter((r) => r.name.toLowerCase().includes(q) || r.tags.toLowerCase().includes(q));
    }
    list = list
      .slice()
      .sort((a, b) =>
        filter.sort === 'popular' ? b.reviewCount - a.reviewCount : a.distanceMeters - b.distanceMeters,
      );
    return list.map((r) => toDomain(r, false));
  }

  async findBySlug(slug: string): Promise<Restaurant | null> {
    const found = seedRestaurants.find((r) => r.slug === slug);
    return found ? toDomain(found, true) : null;
  }

  async findById(id: string): Promise<Restaurant | null> {
    const found = seedRestaurants.find((r) => r.id === id);
    return found ? toDomain(found, true) : null;
  }

  async search(q: string): Promise<SearchResult> {
    const needle = q.trim().toLowerCase();
    if (!needle) return { restaurants: [], items: [] };

    const matchedRestaurants = seedRestaurants
      .filter((r) => r.name.toLowerCase().includes(needle) || r.tags.toLowerCase().includes(needle))
      .map((r) => toDomain(r, false));

    const items: SearchItemHit[] = [];
    for (const restaurant of seedRestaurants) {
      for (const section of restaurant.sections) {
        for (const item of section.items) {
          if (item.name.toLowerCase().includes(needle) || item.description.toLowerCase().includes(needle)) {
            items.push({
              item: toMenuItemDomain(item, section.id),
              restaurantSlug: restaurant.slug,
              restaurantName: restaurant.name,
            });
          }
        }
      }
    }

    return { restaurants: matchedRestaurants, items };
  }
}

function toDomain(seed: SeedRestaurant, includeMenu: boolean): Restaurant {
  const openingHours = includeMenu
    ? seed.openingHours.map((oh) => ({
        dayOfWeek: oh.dayOfWeek,
        opensAtMinutes: oh.opensAtMinutes,
        closesAtMinutes: oh.closesAtMinutes,
      }))
    : [];

  const sections: MenuSection[] = includeMenu
    ? seed.sections
        .slice()
        .sort((a, b) => a.position - b.position)
        .map((section) => ({
          id: section.id,
          name: section.name,
          position: section.position,
          items: section.items.map((item) => toMenuItemDomain(item, section.id)),
        }))
    : [];

  return new Restaurant(
    seed.id,
    seed.slug,
    seed.name,
    seed.category,
    seed.tags,
    seed.rating,
    seed.reviewCount,
    seed.distanceMeters,
    seed.prepTimeMinutes,
    seed.isOpen,
    seed.coverUrl,
    seed.logoUrl,
    seed.addressLine,
    seed.neighborhood,
    seed.city,
    seed.phone,
    openingHours,
    sections,
  );
}

function toMenuItemDomain(item: SeedMenuItem, sectionId: string): MenuItem {
  const modifierGroups: ModifierGroup[] = item.modifierGroups
    .slice()
    .sort((a, b) => a.position - b.position)
    .map((group) => ({
      id: group.id,
      name: group.name,
      helperText: group.helperText,
      minSelect: group.minSelect,
      maxSelect: group.maxSelect,
      position: group.position,
      options: group.options
        .slice()
        .sort((a, b) => a.position - b.position)
        .map(
          (option): ModifierOption => ({
            id: option.id,
            name: option.name,
            priceDeltaCents: option.priceDelta,
            available: option.available,
            position: option.position,
          }),
        ),
    }));

  return {
    id: item.id,
    sectionId,
    name: item.name,
    description: item.description,
    priceCents: item.priceCents,
    imageUrl: item.imageUrl,
    availability: item.availability,
    isPopular: item.isPopular,
    promoLabel: item.promoLabel,
    modifierGroups,
  };
}
