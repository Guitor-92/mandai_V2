export default function RestaurantLoading() {
  return (
    <>
      <div style={{ height: 260, background: "var(--ink-100)" }} />
      <section className="container" style={{ paddingTop: 32 }}>
        <div style={{ height: 120, background: "var(--ink-100)", borderRadius: "var(--r-lg)", marginTop: -64 }} />
        <div style={{ display: "grid", gridTemplateColumns: "240px 1fr 340px", gap: 32, marginTop: 32 }}>
          <div />
          <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} style={{ height: 130, background: "var(--ink-100)", borderRadius: "var(--r-md)" }} />
            ))}
          </div>
          <div style={{ height: 260, background: "var(--ink-100)", borderRadius: "var(--r-lg)" }} />
        </div>
      </section>
    </>
  );
}
