import { RestaurantGridSkeleton } from "@/modules/restaurants/components/RestaurantCardSkeleton";

export default function HomeLoading() {
  return (
    <section className="container" style={{ paddingTop: 56, paddingBottom: 56 }}>
      <div style={{ height: 32, width: 260, background: "var(--ink-100)", borderRadius: 8, marginBottom: 20 }} />
      <RestaurantGridSkeleton count={6} />
    </section>
  );
}
