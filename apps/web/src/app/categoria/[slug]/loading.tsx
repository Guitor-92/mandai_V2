import { RestaurantGridSkeleton } from "@/modules/restaurants/components/RestaurantCardSkeleton";

export default function CategoryLoading() {
  return (
    <section className="container" style={{ paddingTop: 32, paddingBottom: 56 }}>
      <div style={{ height: 48, width: 320, background: "var(--ink-100)", borderRadius: 8, marginTop: 16, marginBottom: 36 }} />
      <RestaurantGridSkeleton count={6} />
    </section>
  );
}
