"use client";

import { useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import type { MenuItem, Restaurant, RestaurantDetail } from "@/shared/types";
import { RestaurantHero } from "@/modules/restaurants/components/RestaurantHero";
import { MenuNav } from "@/modules/restaurants/components/MenuNav";
import { MenuSectionBlock } from "@/modules/restaurants/components/MenuSectionBlock";
import { ClosedRestaurantView } from "@/modules/restaurants/components/ClosedRestaurantView";
import { OutOfStockModal } from "@/modules/restaurants/components/OutOfStockModal";
import { MiniCartRail } from "@/modules/cart/components/MiniCartRail";
import { AddItemModal } from "@/modules/cart/components/AddItemModal";
import { useCart } from "@/modules/cart/context";
import { useToast, ToastViewport } from "@/shared/components/Toast";

function findItem(restaurant: RestaurantDetail, itemId: string): MenuItem | undefined {
  for (const section of restaurant.sections) {
    const item = section.items.find((i) => i.id === itemId);
    if (item) return item;
  }
  return undefined;
}

export function RestaurantScreen({ restaurant, nearbyOpen }: { restaurant: RestaurantDetail; nearbyOpen: Restaurant[] }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { addItem } = useCart();
  const { message, showToast } = useToast();

  const itemId = searchParams.get("item");
  const activeItem = itemId ? findItem(restaurant, itemId) : undefined;

  // DP-08: seção sem prato fica oculta.
  const sections = useMemo(() => restaurant.sections.filter((s) => s.items.length > 0), [restaurant.sections]);
  const navSections = useMemo(() => sections.map((s) => ({ id: s.id, name: s.name })), [sections]);

  function openItem(item: MenuItem) {
    router.push(`${pathname}?item=${item.id}`, { scroll: false });
  }

  function closeItem() {
    router.push(pathname, { scroll: false });
  }

  if (!restaurant.isOpen) {
    return <ClosedRestaurantView restaurant={restaurant} nearbyOpen={nearbyOpen} />;
  }

  return (
    <>
      <RestaurantHero restaurant={restaurant} />

      <section className="container" style={{ paddingTop: 32, paddingBottom: 24 }}>
        <div style={{ display: "grid", gridTemplateColumns: "240px 1fr 340px", gap: 32, alignItems: "flex-start" }}>
          <MenuNav sections={navSections} />
          <div>
            {sections.map((section) => (
              <MenuSectionBlock key={section.id} section={section} onItemClick={openItem} />
            ))}
          </div>
          <MiniCartRail />
        </div>
      </section>

      {activeItem &&
        (activeItem.availability === "OUT_OF_STOCK" ? (
          <OutOfStockModal
            itemName={activeItem.name}
            restaurantName={restaurant.name}
            onClose={closeItem}
            onNotify={() => {
              closeItem();
              showToast("Esse aviso ainda tá em obras por aqui. Vale espiar de novo mais tarde.");
            }}
          />
        ) : (
          <AddItemModal
            item={activeItem}
            onClose={closeItem}
            onConfirm={({ qty, modifiers, note }) => {
              addItem({
                restaurantSlug: restaurant.slug,
                restaurantName: restaurant.name,
                menuItemId: activeItem.id,
                name: activeItem.name,
                imageUrl: activeItem.imageUrl,
                unitPriceCents: activeItem.priceCents,
                qty,
                modifiers,
                note,
              });
              closeItem();
            }}
          />
        ))}
      <ToastViewport message={message} />
    </>
  );
}
