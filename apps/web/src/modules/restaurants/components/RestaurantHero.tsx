import Image from "next/image";
import { Check, MapPin, Star } from "lucide-react";
import type { RestaurantDetail } from "@/shared/types";
import { formatDistance, formatRating } from "@/shared/lib/money";

export function RestaurantHero({ restaurant }: { restaurant: RestaurantDetail }) {
  return (
    <section style={{ position: "relative" }}>
      <div style={{ height: 260, position: "relative" }}>
        <Image src={restaurant.coverUrl} alt="" fill sizes="1440px" style={{ objectFit: "cover" }} priority />
        <div
          style={{
            position: "absolute",
            inset: 0,
            background: "linear-gradient(180deg, rgba(28,24,18,0.05) 0%, rgba(28,24,18,0.45) 100%)",
          }}
        />
      </div>
      <div className="container" style={{ position: "relative" }}>
        <div
          style={{
            background: "var(--white)",
            borderRadius: "var(--r-lg)",
            boxShadow: "var(--shadow-3)",
            padding: "24px 28px",
            marginTop: -64,
            display: "flex",
            gap: 24,
            alignItems: "center",
            position: "relative",
            zIndex: 2,
          }}
        >
          <div style={{ width: 88, height: 88, borderRadius: 18, position: "relative", flexShrink: 0, boxShadow: "var(--shadow-1)", border: "3px solid var(--white)", overflow: "hidden" }}>
            <Image src={restaurant.logoUrl} alt="" fill sizes="88px" style={{ objectFit: "cover" }} />
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
              <h1 style={{ fontFamily: "var(--font-display)", fontSize: 32, fontWeight: 800, color: "var(--ink-800)", letterSpacing: "-0.025em" }}>
                {restaurant.name}
              </h1>
              <span style={{ background: "var(--folha-50)", color: "var(--folha-700)", fontSize: 12, fontWeight: 700, padding: "5px 9px", borderRadius: "var(--r-xs)", display: "inline-flex", alignItems: "center", gap: 4 }}>
                <Check size={11} /> Aberto agora
              </span>
            </div>
            <div style={{ display: "flex", gap: 18, marginTop: 8, alignItems: "center", color: "var(--fg-2)", fontSize: 14, flexWrap: "wrap" }}>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontWeight: 600, color: "var(--ink-700)" }}>
                <Star size={14} color="var(--manga-400)" /> {formatRating(restaurant.rating)} · {restaurant.reviewCount.toLocaleString("pt-BR")} avaliações
              </span>
              <span>·</span>
              <span>{restaurant.tags}</span>
              <span>·</span>
              <span style={{ display: "inline-flex", alignItems: "center", gap: 4 }}>
                <MapPin size={13} /> {restaurant.addressLine} — {restaurant.neighborhood}
              </span>
              <span>·</span>
              <span>{formatDistance(restaurant.distanceMeters)}</span>
            </div>
          </div>
          <div style={{ background: "var(--folha-50)", padding: "14px 18px", borderRadius: "var(--r-md)", textAlign: "center" }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "var(--folha-700)", letterSpacing: "0.1em", textTransform: "uppercase" }}>Pronto em</div>
            <div style={{ fontFamily: "var(--font-mono)", fontSize: 22, fontWeight: 700, color: "var(--folha-700)", marginTop: 2 }}>~{restaurant.prepTimeMinutes} min</div>
          </div>
        </div>
      </div>
    </section>
  );
}
