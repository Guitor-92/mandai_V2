"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { Clock, Filter, MapPin, Search as SearchIcon, Store } from "lucide-react";
import type { Restaurant, SearchMenuItemHit } from "@/shared/types";
import { Highlight } from "@/modules/search/components/Highlight";
import { formatCents, formatDistance, formatRating } from "@/shared/lib/money";
import { getRecentSearches } from "@/modules/search/recent-searches";
import { useCart } from "@/modules/cart/context";
import { useToast, ToastViewport } from "@/shared/components/Toast";

export function SearchResultsView({
  query,
  restaurants,
  items,
}: {
  query: string;
  restaurants: Restaurant[];
  items: SearchMenuItemHit[];
}) {
  const [onlyOpen, setOnlyOpen] = useState(false);
  const [maxPrep, setMaxPrep] = useState<number | null>(null);
  const [recent, setRecent] = useState<string[]>([]);
  const { addItem } = useCart();
  const { message, showToast } = useToast();

  useEffect(() => {
    setRecent(getRecentSearches().filter((r) => r.toLowerCase() !== query.toLowerCase()));
  }, [query]);

  const filteredRestaurants = useMemo(
    () =>
      restaurants.filter((r) => {
        if (onlyOpen && !r.isOpen) return false;
        if (maxPrep !== null && r.prepTimeMinutes > maxPrep) return false;
        return true;
      }),
    [restaurants, onlyOpen, maxPrep],
  );

  return (
    <section className="container" style={{ paddingTop: 28, paddingBottom: 56 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 22 }}>
        <div>
          <div className="eyebrow" style={{ color: "var(--fg-2)" }}>
            Resultados da busca
          </div>
          <h1
            style={{
              fontFamily: "var(--font-display)",
              fontSize: 40,
              fontWeight: 800,
              color: "var(--ink-800)",
              letterSpacing: "-0.03em",
              lineHeight: 1,
              marginTop: 6,
            }}
          >
            &quot;{query}&quot;
          </h1>
          <div style={{ fontSize: 14, color: "var(--fg-2)", marginTop: 8 }}>
            <span style={{ color: "var(--ink-700)", fontWeight: 600 }}>{filteredRestaurants.length} restaurantes</span> e{" "}
            <span style={{ color: "var(--ink-700)", fontWeight: 600 }}>{items.length} pratos</span>
          </div>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 32, alignItems: "flex-start" }}>
        <div style={{ display: "flex", flexDirection: "column", gap: 36 }}>
          <div>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 800, color: "var(--ink-800)", letterSpacing: "-0.02em", marginBottom: 14 }}>
              Restaurantes <span style={{ fontFamily: "var(--font-mono)", fontSize: 14, color: "var(--fg-2)", fontWeight: 500, marginLeft: 6 }}>{filteredRestaurants.length}</span>
            </h2>
            {filteredRestaurants.length === 0 ? (
              <p style={{ fontSize: 14, color: "var(--fg-2)" }}>Nenhum restaurante bateu com os filtros.</p>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
                {filteredRestaurants.map((r) => (
                  <Link key={r.id} href={`/restaurante/${r.slug}`} className="card" style={{ padding: 0, overflow: "hidden", display: "flex", textDecoration: "none", color: "inherit" }}>
                    <div style={{ width: 180, flexShrink: 0, position: "relative" }}>
                      <Image src={r.coverUrl} alt="" fill sizes="180px" style={{ objectFit: "cover" }} />
                    </div>
                    <div style={{ padding: "18px 22px", flex: 1, display: "flex", flexDirection: "column", gap: 6 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
                        <div>
                          <div style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 800, color: "var(--ink-800)", letterSpacing: "-0.015em" }}>
                            <Highlight text={r.name} match={query} />
                          </div>
                          <div style={{ fontSize: 13, color: "var(--fg-2)", marginTop: 2 }}>{r.tags}</div>
                        </div>
                        <span
                          style={{
                            background: r.isOpen ? "var(--folha-50)" : "var(--ink-100)",
                            color: r.isOpen ? "var(--folha-700)" : "var(--ink-500)",
                            fontSize: 11,
                            fontWeight: 700,
                            padding: "5px 10px",
                            borderRadius: 999,
                            letterSpacing: "0.06em",
                            textTransform: "uppercase",
                            flexShrink: 0,
                          }}
                        >
                          {r.isOpen ? "Aberto" : "Fechado"}
                        </span>
                      </div>
                      <div style={{ display: "flex", gap: 16, alignItems: "center", marginTop: 8, flexWrap: "wrap" }}>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 13, color: "var(--ink-700)", fontWeight: 600 }}>
                          <span style={{ color: "var(--manga-500)" }}>★</span>
                          <span className="price">{formatRating(r.rating)}</span>
                          <span style={{ color: "var(--fg-3)", fontWeight: 500, fontSize: 12 }}>({r.reviewCount})</span>
                        </span>
                        <span style={{ width: 3, height: 3, borderRadius: "50%", background: "var(--fg-3)" }} />
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 13, color: "var(--folha-700)", fontWeight: 600 }}>
                          <Clock size={12} color="var(--folha-600)" /> {r.prepTimeMinutes} min
                        </span>
                        <span style={{ width: 3, height: 3, borderRadius: "50%", background: "var(--fg-3)" }} />
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 13, color: "var(--ink-600)" }}>
                          <MapPin size={12} color="var(--fg-3)" /> {formatDistance(r.distanceMeters)}
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 800, color: "var(--ink-800)", letterSpacing: "-0.02em", marginBottom: 14 }}>
              Pratos <span style={{ fontFamily: "var(--font-mono)", fontSize: 14, color: "var(--fg-2)", fontWeight: 500, marginLeft: 6 }}>{items.length}</span>
            </h2>
            {items.length === 0 ? (
              <p style={{ fontSize: 14, color: "var(--fg-2)" }}>Nenhum prato bateu com &quot;{query}&quot;.</p>
            ) : (
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 14 }}>
                {items.map((d) => {
                  const canQuickAdd = d.modifierGroups.length === 0 && d.availability !== "OUT_OF_STOCK";
                  return (
                    <div key={d.id} className="card" style={{ padding: 0, overflow: "hidden", display: "flex" }}>
                      <div style={{ width: 120, flexShrink: 0, position: "relative" }}>
                        <Image src={d.imageUrl} alt="" fill sizes="120px" style={{ objectFit: "cover" }} />
                      </div>
                      <div style={{ padding: "14px 16px", flex: 1, display: "flex", flexDirection: "column" }}>
                        <div style={{ fontFamily: "var(--font-display)", fontSize: 15, fontWeight: 700, color: "var(--ink-800)", letterSpacing: "-0.01em", lineHeight: 1.2 }}>
                          <Highlight text={d.name} match={query} />
                        </div>
                        <div style={{ fontSize: 12, color: "var(--fg-2)", marginTop: 4, display: "inline-flex", alignItems: "center", gap: 5 }}>
                          <Store size={11} color="var(--fg-3)" /> {d.restaurantName}
                        </div>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "auto", paddingTop: 10 }}>
                          <span className="price" style={{ fontSize: 14, color: "var(--ink-800)" }}>
                            {formatCents(d.priceCents)}
                          </span>
                          {d.availability === "OUT_OF_STOCK" ? (
                            <button type="button" className="btn btn-secondary" style={{ padding: "7px 12px", fontSize: 12 }} onClick={() => showToast("Esse aviso ainda tá em obras por aqui. Vale espiar de novo mais tarde.")}>
                              Me avisa
                            </button>
                          ) : canQuickAdd ? (
                            <button
                              type="button"
                              className="btn btn-primary"
                              style={{ padding: "7px 12px", fontSize: 12 }}
                              onClick={() =>
                                addItem({
                                  restaurantSlug: d.restaurantSlug,
                                  restaurantName: d.restaurantName,
                                  menuItemId: d.id,
                                  name: d.name,
                                  imageUrl: d.imageUrl,
                                  unitPriceCents: d.priceCents,
                                  qty: 1,
                                  modifiers: [],
                                })
                              }
                            >
                              Adicionar
                            </button>
                          ) : (
                            <Link href={`/restaurante/${d.restaurantSlug}?item=${d.id}`} className="btn btn-primary" style={{ padding: "7px 12px", fontSize: 12 }}>
                              Escolher
                            </Link>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <aside style={{ position: "sticky", top: 100, display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="card" style={{ padding: 22 }}>
            <h3 style={{ fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 700, color: "var(--ink-800)", letterSpacing: "-0.01em", margin: 0, marginBottom: 14, display: "flex", alignItems: "center", gap: 8 }}>
              <Filter size={14} /> Refinar
            </h3>
            <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", fontSize: 13, color: "var(--ink-700)", marginBottom: 16 }}>
              <input type="checkbox" checked={onlyOpen} onChange={(e) => setOnlyOpen(e.target.checked)} style={{ accentColor: "var(--tomate-500)", width: 16, height: 16 }} />
              Só restaurantes abertos
            </label>
            <div style={{ fontSize: 11, fontWeight: 700, color: "var(--ink-700)", letterSpacing: "0.08em", textTransform: "uppercase", marginBottom: 8 }}>Tempo de preparo</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
              {[
                { label: "até 20 min", value: 20 },
                { label: "até 35 min", value: 35 },
                { label: "qualquer tempo", value: null },
              ].map((opt) => (
                <label key={opt.label} style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--ink-700)", cursor: "pointer" }}>
                  <input type="radio" name="prep" checked={maxPrep === opt.value} onChange={() => setMaxPrep(opt.value)} style={{ accentColor: "var(--tomate-500)" }} />
                  {opt.label}
                </label>
              ))}
            </div>
          </div>

          {recent.length > 0 && (
            <div className="card" style={{ padding: 22 }}>
              <h4 style={{ fontFamily: "var(--font-display)", fontSize: 15, fontWeight: 700, color: "var(--ink-800)", margin: 0, marginBottom: 12 }}>
                Buscas recentes
              </h4>
              <div style={{ display: "flex", flexDirection: "column" }}>
                {recent.map((r, i) => (
                  <Link
                    key={r}
                    href={`/busca?q=${encodeURIComponent(r)}`}
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      fontSize: 13,
                      color: "var(--ink-700)",
                      textDecoration: "none",
                      padding: "10px 0",
                      borderTop: i === 0 ? 0 : "1px solid var(--border-1)",
                    }}
                  >
                    <span style={{ display: "inline-flex", alignItems: "center", gap: 8 }}>
                      <SearchIcon size={12} color="var(--fg-3)" />
                      {r}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </aside>
      </div>
      <ToastViewport message={message} />
    </section>
  );
}
