import { apiFetch, buildQuery } from "@/shared/lib/api";
import type { Restaurant, RestaurantDetail } from "@/shared/types";

export type RestaurantSort = "distance" | "popular";

export function getRestaurants(params?: { category?: string; q?: string; sort?: RestaurantSort }): Promise<Restaurant[]> {
  return apiFetch<Restaurant[]>(
    `/api/restaurants${buildQuery({ category: params?.category, q: params?.q, sort: params?.sort })}`,
  );
}

export function getRestaurantBySlug(slug: string): Promise<RestaurantDetail> {
  return apiFetch<RestaurantDetail>(`/api/restaurants/${slug}`);
}
