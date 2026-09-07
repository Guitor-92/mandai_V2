// Popula o Postgres a partir da fonte única `seed-data.ts`.
// Rodar com `npm run db:seed` (precisa de DATABASE_URL configurada).

import { PrismaClient } from '@prisma/client';
import { restaurants, coupons } from './seed-data';

const prisma = new PrismaClient();

async function main() {
  console.log('Limpando dados existentes...');
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.modifierOption.deleteMany();
  await prisma.modifierGroup.deleteMany();
  await prisma.menuItem.deleteMany();
  await prisma.menuSection.deleteMany();
  await prisma.openingHour.deleteMany();
  await prisma.restaurant.deleteMany();
  await prisma.coupon.deleteMany();

  console.log('Criando cupons...');
  for (const coupon of coupons) {
    await prisma.coupon.create({
      data: {
        code: coupon.code,
        label: coupon.label,
        percentOff: coupon.percentOff,
        amountOffCents: coupon.amountOffCents,
        minSubtotal: coupon.minSubtotal,
        expiresAt: new Date(coupon.expiresAt),
        active: coupon.active,
      },
    });
  }

  console.log(`Criando ${restaurants.length} restaurantes...`);
  for (const restaurant of restaurants) {
    await prisma.restaurant.create({
      data: {
        id: restaurant.id,
        slug: restaurant.slug,
        name: restaurant.name,
        category: restaurant.category,
        tags: restaurant.tags,
        rating: restaurant.rating,
        reviewCount: restaurant.reviewCount,
        distanceMeters: restaurant.distanceMeters,
        prepTimeMinutes: restaurant.prepTimeMinutes,
        isOpen: restaurant.isOpen,
        coverUrl: restaurant.coverUrl,
        logoUrl: restaurant.logoUrl,
        addressLine: restaurant.addressLine,
        neighborhood: restaurant.neighborhood,
        city: restaurant.city,
        phone: restaurant.phone,
        openingHours: {
          create: restaurant.openingHours.map((oh) => ({
            id: oh.id,
            dayOfWeek: oh.dayOfWeek,
            opensAtMinutes: oh.opensAtMinutes,
            closesAtMinutes: oh.closesAtMinutes,
          })),
        },
        sections: {
          create: restaurant.sections.map((section) => ({
            id: section.id,
            name: section.name,
            position: section.position,
            items: {
              create: section.items.map((item) => ({
                id: item.id,
                name: item.name,
                description: item.description,
                priceCents: item.priceCents,
                imageUrl: item.imageUrl,
                availability: item.availability,
                isPopular: item.isPopular,
                promoLabel: item.promoLabel,
                modifierGroups: {
                  create: item.modifierGroups.map((group) => ({
                    id: group.id,
                    name: group.name,
                    helperText: group.helperText,
                    minSelect: group.minSelect,
                    maxSelect: group.maxSelect,
                    position: group.position,
                    options: {
                      create: group.options.map((option) => ({
                        id: option.id,
                        name: option.name,
                        priceDelta: option.priceDelta,
                        available: option.available,
                        position: option.position,
                      })),
                    },
                  })),
                },
              })),
            },
          })),
        },
      },
    });
  }

  console.log('Seed concluído.');
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
