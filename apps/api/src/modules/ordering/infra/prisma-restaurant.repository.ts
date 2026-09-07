import type {
  PrismaClient,
  Restaurant as PrismaRestaurant,
  OpeningHour as PrismaOpeningHour,
  MenuSection as PrismaMenuSection,
  MenuItem as PrismaMenuItem,
  ModifierGroup as PrismaModifierGroup,
  ModifierOption as PrismaModifierOption,
} from '@prisma/client';
import { Restaurant } from '../domain/entities/restaurant';
import type { MenuItem, MenuSection, ModifierGroup, ModifierOption } from '../domain/entities/menu-item';
import type {
  RestaurantRepository,
  RestaurantFilter,
  SearchResult,
  SearchItemHit,
} from '../domain/repositories/restaurant.repository';

type FullModifierGroup = PrismaModifierGroup & { options: PrismaModifierOption[] };
type FullMenuItem = PrismaMenuItem & { modifierGroups: FullModifierGroup[] };
type FullSection = PrismaMenuSection & { items: FullMenuItem[] };
type FullRestaurant = PrismaRestaurant & { openingHours: PrismaOpeningHour[]; sections: FullSection[] };

const menuInclude = {
  modifierGroups: {
    orderBy: { position: 'asc' as const },
    include: { options: { orderBy: { position: 'asc' as const } } },
  },
};

const fullInclude = {
  openingHours: true,
  sections: {
    orderBy: { position: 'asc' as const },
    include: { items: { include: menuInclude } },
  },
};

export class PrismaRestaurantRepository implements RestaurantRepository {
  constructor(private readonly prisma: PrismaClient) {}

  async findAll(filter: RestaurantFilter = {}): Promise<Restaurant[]> {
    const rows = await this.prisma.restaurant.findMany({
      where: {
        category: filter.category,
        ...(filter.q
          ? {
              OR: [
                { name: { contains: filter.q, mode: 'insensitive' } },
                { tags: { contains: filter.q, mode: 'insensitive' } },
              ],
            }
          : {}),
      },
      orderBy: filter.sort === 'popular' ? { reviewCount: 'desc' } : { distanceMeters: 'asc' },
    });
    return rows.map((row) => toDomain({ ...row, openingHours: [], sections: [] }));
  }

  async findBySlug(slug: string): Promise<Restaurant | null> {
    const row = await this.prisma.restaurant.findUnique({ where: { slug }, include: fullInclude });
    return row ? toDomain(row) : null;
  }

  async findById(id: string): Promise<Restaurant | null> {
    const row = await this.prisma.restaurant.findUnique({ where: { id }, include: fullInclude });
    return row ? toDomain(row) : null;
  }

  async search(q: string): Promise<SearchResult> {
    const needle = q.trim();
    if (!needle) return { restaurants: [], items: [] };

    const [restaurantRows, itemRows] = await Promise.all([
      this.prisma.restaurant.findMany({
        where: {
          OR: [
            { name: { contains: needle, mode: 'insensitive' } },
            { tags: { contains: needle, mode: 'insensitive' } },
          ],
        },
      }),
      this.prisma.menuItem.findMany({
        where: {
          OR: [
            { name: { contains: needle, mode: 'insensitive' } },
            { description: { contains: needle, mode: 'insensitive' } },
          ],
        },
        include: {
          ...menuInclude,
          section: { include: { restaurant: true } },
        },
      }),
    ]);

    const items: SearchItemHit[] = itemRows.map((row) => ({
      item: toMenuItemDomain(row, row.sectionId),
      restaurantSlug: row.section.restaurant.slug,
      restaurantName: row.section.restaurant.name,
    }));

    return {
      restaurants: restaurantRows.map((row) => toDomain({ ...row, openingHours: [], sections: [] })),
      items,
    };
  }
}

function toDomain(row: FullRestaurant): Restaurant {
  const openingHours = row.openingHours.map((oh) => ({
    dayOfWeek: oh.dayOfWeek,
    opensAtMinutes: oh.opensAtMinutes,
    closesAtMinutes: oh.closesAtMinutes,
  }));

  const sections: MenuSection[] = row.sections.map((section) => ({
    id: section.id,
    name: section.name,
    position: section.position,
    items: section.items.map((item) => toMenuItemDomain(item, section.id)),
  }));

  return new Restaurant(
    row.id,
    row.slug,
    row.name,
    row.category,
    row.tags,
    row.rating,
    row.reviewCount,
    row.distanceMeters,
    row.prepTimeMinutes,
    row.isOpen,
    row.coverUrl,
    row.logoUrl,
    row.addressLine,
    row.neighborhood,
    row.city,
    row.phone,
    openingHours,
    sections,
  );
}

function toMenuItemDomain(row: FullMenuItem, sectionId: string): MenuItem {
  const modifierGroups: ModifierGroup[] = row.modifierGroups.map((group) => ({
    id: group.id,
    name: group.name,
    helperText: group.helperText,
    minSelect: group.minSelect,
    maxSelect: group.maxSelect,
    position: group.position,
    options: group.options.map(
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
    id: row.id,
    sectionId,
    name: row.name,
    description: row.description,
    priceCents: row.priceCents,
    imageUrl: row.imageUrl,
    availability: row.availability,
    isPopular: row.isPopular,
    promoLabel: row.promoLabel,
    modifierGroups,
  };
}
