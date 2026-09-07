export function RestaurantCardSkeleton() {
  return (
    <div className="r-card" aria-hidden="true">
      <div className="cover" style={{ background: "var(--ink-100)" }} />
      <div className="body">
        <div style={{ height: 18, width: "70%", background: "var(--ink-100)", borderRadius: 6 }} />
        <div style={{ height: 13, width: "50%", background: "var(--ink-100)", borderRadius: 6, marginTop: 8 }} />
        <div style={{ height: 12, width: "80%", background: "var(--ink-100)", borderRadius: 6, marginTop: 14 }} />
      </div>
    </div>
  );
}

export function RestaurantGridSkeleton({ count = 6 }: { count?: number }) {
  return (
    <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
      {Array.from({ length: count }).map((_, i) => (
        <RestaurantCardSkeleton key={i} />
      ))}
    </div>
  );
}
