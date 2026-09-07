import { Suspense } from "react";
import { notFound } from "next/navigation";
import { ApiError } from "@/shared/lib/api";
import { getRestaurantBySlug, getRestaurants } from "@/modules/restaurants/services/restaurants.api";
import { RestaurantScreen } from "@/modules/restaurants/components/RestaurantScreen";

export default async function RestaurantPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  let restaurant;
  try {
    restaurant = await getRestaurantBySlug(slug);
  } catch (err) {
    if (err instanceof ApiError && err.statusCode === 404) notFound();
    throw err;
  }

  const nearbyOpen = restaurant.isOpen
    ? []
    : (await getRestaurants())
        .filter((r) => r.isOpen && r.slug !== restaurant.slug)
        .sort((a, b) => a.distanceMeters - b.distanceMeters)
        .slice(0, 3);

  return (
    <Suspense fallback={null}>
      <RestaurantScreen restaurant={restaurant} nearbyOpen={nearbyOpen} />
    </Suspense>
  );
}
