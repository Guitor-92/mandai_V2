"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ArrowRight, ChevronLeft, Clock, ShoppingBag, Ticket } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import type { Restaurant } from "@/shared/types";
import { getRestaurants } from "@/modules/restaurants/services/restaurants.api";
import { getRecentOrders, type RecentOrder } from "@/modules/orders/recent-orders";
import { formatRelativeDate } from "@/shared/lib/date";

export function EmptyCartView() {
  const { data: restaurants } = useQuery<Restaurant[]>({
    queryKey: ["restaurants", "empty-cart-suggestions"],
    queryFn: () => getRestaurants(),
  });
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);

  useEffect(() => {
    setRecentOrders(getRecentOrders());
  }, []);

  const suggestions = [...(restaurants ?? [])].sort((a, b) => a.distanceMeters - b.distanceMeters).slice(0, 4);

  return (
    <section className="container" style={{ paddingTop: 32, paddingBottom: 56 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--fg-2)", marginBottom: 14 }}>
        <Link href="/" style={{ color: "var(--fg-2)", display: "inline-flex", alignItems: "center", gap: 4, textDecoration: "none" }}>
          <ChevronLeft size={13} /> Voltar pra home
        </Link>
      </div>
      <h1 style={{ fontFamily: "var(--font-display)", fontSize: 40, fontWeight: 800, color: "var(--ink-800)", letterSpacing: "-0.03em", lineHeight: 1 }}>
        Sua sacola
      </h1>
      <div style={{ fontSize: 15, color: "var(--fg-2)", marginTop: 8 }}>Nada por aqui ainda</div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: 32, marginTop: 32, alignItems: "flex-start" }}>
        <div>
          <div className="card" style={{ padding: "56px 48px", textAlign: "center" }}>
            <div style={{ width: 140, height: 140, borderRadius: "50%", background: "var(--tomate-50)", display: "grid", placeItems: "center", margin: "0 auto 22px" }}>
              <ShoppingBag size={64} color="var(--tomate-500)" strokeWidth={1.5} />
            </div>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: 30, fontWeight: 800, color: "var(--ink-800)", letterSpacing: "-0.025em", lineHeight: 1.05, margin: 0 }}>
              Carrinho vazio que nem
              <br />
              geladeira de domingo
            </h2>
            <p style={{ fontSize: 15, color: "var(--fg-2)", marginTop: 12, maxWidth: 440, marginLeft: "auto", marginRight: "auto", lineHeight: 1.5 }}>
              Bora escolher um rango? Tem restaurante prontos pra mandar comida boa pra você.
            </p>
            <div style={{ display: "inline-flex", gap: 10, marginTop: 26 }}>
              <Link href="/" className="btn btn-primary" style={{ padding: "14px 26px", fontSize: 15 }}>
                Explorar restaurantes <ArrowRight size={15} />
              </Link>
            </div>
          </div>

          {suggestions.length > 0 && (
            <div style={{ marginTop: 36 }}>
              <h3 style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 800, color: "var(--ink-800)", letterSpacing: "-0.02em", marginBottom: 16 }}>
                Que tal começar por aqui?
              </h3>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16 }}>
                {suggestions.map((r) => (
                  <Link key={r.id} href={`/restaurante/${r.slug}`} className="card" style={{ padding: 0, overflow: "hidden", display: "flex", textDecoration: "none", color: "inherit" }}>
                    <div style={{ width: 120, flexShrink: 0, position: "relative" }}>
                      <Image src={r.coverUrl} alt="" fill sizes="120px" style={{ objectFit: "cover" }} />
                    </div>
                    <div style={{ padding: "14px 16px", flex: 1, display: "flex", flexDirection: "column", gap: 4 }}>
                      <div style={{ fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 700, color: "var(--ink-800)", letterSpacing: "-0.01em" }}>{r.name}</div>
                      <div style={{ fontSize: 12, color: "var(--fg-2)" }}>{r.tags}</div>
                      <div style={{ display: "flex", gap: 10, alignItems: "center", marginTop: "auto", paddingTop: 8 }}>
                        <span style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 12, color: "var(--folha-700)", fontWeight: 600 }}>
                          <Clock size={11} color="var(--folha-600)" /> {r.prepTimeMinutes} min
                        </span>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>

        <aside style={{ position: "sticky", top: 100, display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="card" style={{ padding: 22 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 12 }}>
              <div style={{ width: 40, height: 40, borderRadius: 12, background: "var(--folha-50)", color: "var(--folha-700)", display: "grid", placeItems: "center", flexShrink: 0 }}>
                <ShoppingBag size={20} />
              </div>
              <div>
                <div style={{ fontFamily: "var(--font-display)", fontSize: 17, fontWeight: 800, color: "var(--ink-800)", letterSpacing: "-0.015em" }}>Tudo pra retirada</div>
                <div style={{ fontSize: 12, color: "var(--fg-2)" }}>Sem taxa de entrega, sem espera longa</div>
              </div>
            </div>
            <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 10 }}>
              {["Você pede pelo site", "A gente gera um código pra você", "Mostra o código no balcão e pega seu rango"].map((s, i) => (
                <li key={i} style={{ display: "flex", gap: 10, alignItems: "flex-start", fontSize: 13, color: "var(--ink-700)", lineHeight: 1.45 }}>
                  <span
                    style={{
                      width: 22,
                      height: 22,
                      borderRadius: "50%",
                      background: "var(--tomate-50)",
                      color: "var(--tomate-600)",
                      fontFamily: "var(--font-mono)",
                      fontWeight: 700,
                      fontSize: 11,
                      display: "grid",
                      placeItems: "center",
                      flexShrink: 0,
                      marginTop: 1,
                    }}
                  >
                    {i + 1}
                  </span>
                  {s}
                </li>
              ))}
            </ul>
          </div>

          {recentOrders.length > 0 && (
            <div className="card" style={{ padding: 22 }}>
              <h4 style={{ fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 700, color: "var(--ink-800)", letterSpacing: "-0.01em", margin: 0, marginBottom: 12 }}>
                Você já pediu aqui
              </h4>
              <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 10 }}>
                {recentOrders.map((o, i) => (
                  <li key={o.code} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 0", borderTop: i === 0 ? 0 : "1px solid var(--border-1)" }}>
                    <div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: "var(--ink-800)" }}>{o.restaurantName}</div>
                      <div style={{ fontSize: 12, color: "var(--fg-2)", marginTop: 2 }}>{formatRelativeDate(o.createdAt)}</div>
                    </div>
                    <Link href={`/restaurante/${o.restaurantSlug}`} className="btn btn-secondary" style={{ padding: "7px 12px", fontSize: 12 }}>
                      Pedir de novo
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div style={{ padding: "14px 16px", background: "var(--manga-50)", borderRadius: "var(--r-md)", display: "flex", gap: 10, alignItems: "flex-start" }}>
            <div style={{ color: "var(--manga-500)", marginTop: 1 }}>
              <Ticket size={16} />
            </div>
            <div style={{ fontSize: 12, color: "var(--ink-800)", lineHeight: 1.45 }}>
              <strong>Cupom MANDA20</strong> te dá 20% off — aplica na sacola assim que escolher o primeiro prato.
            </div>
          </div>
        </aside>
      </div>
    </section>
  );
}
