import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { getRestaurants } from "@/modules/restaurants/services/restaurants.api";
import { RestaurantCard } from "@/modules/restaurants/components/RestaurantCard";
import { categoryLabel, DEFAULT_NEIGHBORHOOD } from "@/shared/constants";

// DP-04: só os três chips com respaldo no modelo entram como filtro funcional.
const FILTERS = [
  { key: "todos", label: "Todos" },
  { key: "aberto", label: "Aberto agora" },
  { key: "avaliacao", label: "Avaliação 4,5+" },
  { key: "rapido", label: "Pronto em 20 min" },
] as const;

type FilterKey = (typeof FILTERS)[number]["key"];

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ f?: string }>;
}) {
  const { slug } = await params;
  const { f } = await searchParams;
  const activeFilter: FilterKey = (FILTERS.find((x) => x.key === f)?.key ?? "todos") as FilterKey;

  // DP-05: um critério só no MVP — distância crescente, já ordenado pelo servidor.
  const all = await getRestaurants({ category: slug, sort: "distance" });

  const sorted = all.filter((r) => {
    if (activeFilter === "aberto") return r.isOpen;
    if (activeFilter === "avaliacao") return r.rating >= 4.5;
    if (activeFilter === "rapido") return r.prepTimeMinutes <= 20;
    return true;
  });

  const label = categoryLabel(slug);

  return (
    <section className="container" style={{ paddingTop: 32, paddingBottom: 56 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--fg-2)" }}>
        <Link href="/" style={{ color: "var(--fg-2)" }}>
          Início
        </Link>
        <ChevronRight size={12} />
        <span style={{ color: "var(--ink-800)", fontWeight: 600 }}>{label}</span>
      </div>

      <div style={{ display: "flex", alignItems: "flex-end", justifyContent: "space-between", marginTop: 16, gap: 24 }}>
        <div>
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontSize: 48,
              fontWeight: 800,
              letterSpacing: "-0.035em",
              color: "var(--ink-800)",
              lineHeight: 1,
            }}
          >
            {label} pertinho de você
          </h1>
          <div style={{ color: "var(--fg-2)", marginTop: 10, fontSize: 15 }}>
            <span style={{ fontWeight: 600, color: "var(--ink-700)" }}>{sorted.length} restaurantes</span> em{" "}
            {DEFAULT_NEIGHBORHOOD} · prontos pra retirada
          </div>
        </div>
        <div
          style={{
            padding: "12px 18px",
            fontSize: 14,
            color: "var(--ink-700)",
            border: "1px solid var(--border-2)",
            borderRadius: "var(--r-pill)",
          }}
        >
          Ordenar: Distância
        </div>
      </div>

      <div style={{ display: "flex", gap: 10, flexWrap: "wrap", marginTop: 24 }}>
        {FILTERS.map((chip) => (
          <Link
            key={chip.key}
            href={chip.key === "todos" ? `/categoria/${slug}` : `/categoria/${slug}?f=${chip.key}`}
            className={`cat-chip ${activeFilter === chip.key ? "active" : ""}`}
          >
            {chip.label}
          </Link>
        ))}
      </div>

      <div style={{ marginTop: 36 }}>
        {sorted.length === 0 ? (
          <EmptyState label={label} />
        ) : (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 20 }}>
            {sorted.map((r) => (
              <RestaurantCard key={r.id} restaurant={r} />
            ))}
          </div>
        )}
      </div>
    </section>
  );
}

function EmptyState({ label }: { label: string }) {
  return (
    <div className="card" style={{ padding: "48px 32px", textAlign: "center" }}>
      <p style={{ fontSize: 15, color: "var(--fg-2)" }}>
        Nenhum restaurante de {label.toLowerCase()} em {DEFAULT_NEIGHBORHOOD} agora — mas o bairro muda rápido, vale
        espiar de novo daqui a pouco.
      </p>
    </div>
  );
}
