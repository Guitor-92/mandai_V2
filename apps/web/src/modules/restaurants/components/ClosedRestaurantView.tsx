"use client";

import Image from "next/image";
import Link from "next/link";
import { Bell, Clock } from "lucide-react";
import type { Restaurant, RestaurantDetail } from "@/shared/types";
import { MenuSectionBlock } from "@/modules/restaurants/components/MenuSectionBlock";
import { nextOpeningLabel, weeklySchedule } from "@/shared/lib/opening-hours";
import { useToast, ToastViewport } from "@/shared/components/Toast";

// US-09, tela 07 — cardápio continua legível, mas só leitura; sem `+` clicável.
export function ClosedRestaurantView({ restaurant, nearbyOpen }: { restaurant: RestaurantDetail; nearbyOpen: Restaurant[] }) {
  const sections = restaurant.sections.filter((s) => s.items.length > 0);
  const opening = nextOpeningLabel(restaurant.openingHours);
  const schedule = weeklySchedule(restaurant.openingHours);
  const { message, showToast } = useToast();

  return (
    <>
      <div style={{ background: "var(--ink-800)", color: "var(--white)" }}>
        <div className="container" style={{ padding: "14px 0", display: "flex", alignItems: "center", justifyContent: "space-between", gap: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 32, height: 32, borderRadius: "50%", background: "rgba(255,255,255,0.08)", display: "grid", placeItems: "center" }}>
              <Clock size={16} color="var(--manga-300)" />
            </div>
            <div style={{ fontSize: 14 }}>
              <strong style={{ color: "var(--manga-300)" }}>Fechado agora.</strong>
              <span style={{ marginLeft: 8, color: "var(--ink-200)" }}>
                {restaurant.name} {opening}.
              </span>
            </div>
          </div>
          <button
            type="button"
            className="btn btn-ghost"
            style={{ color: "var(--white)", border: "1px solid rgba(255,255,255,0.18)", padding: "8px 14px", fontSize: 13 }}
            onClick={() => showToast(`Ainda não mandamos esse aviso — mas anota aí: ${restaurant.name} ${opening}.`)}
          >
            <Bell size={13} /> Me avisa quando abrir
          </button>
        </div>
      </div>

      <div style={{ position: "relative", height: 280, overflow: "hidden", filter: "saturate(0.7)" }}>
        <Image src={restaurant.coverUrl} alt="" fill sizes="1440px" style={{ objectFit: "cover" }} />
        <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(28,24,18,0.1) 0%, rgba(28,24,18,0.55) 100%)" }} />
        <div className="container" style={{ position: "relative", height: "100%", display: "flex", alignItems: "flex-end", paddingBottom: 28 }}>
          <div>
            <div style={{ display: "inline-flex", alignItems: "center", gap: 8, background: "rgba(28,24,18,0.7)", padding: "6px 12px", borderRadius: 999, marginBottom: 14 }}>
              <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--manga-400)" }} />
              <span style={{ fontSize: 12, fontWeight: 700, color: "var(--white)", letterSpacing: "0.06em", textTransform: "uppercase" }}>Fechado · {opening}</span>
            </div>
            <h1 style={{ fontFamily: "var(--font-display)", fontSize: 48, fontWeight: 800, color: "var(--white)", letterSpacing: "-0.03em", lineHeight: 1 }}>{restaurant.name}</h1>
            <div style={{ color: "rgba(255,255,255,0.85)", fontSize: 15, marginTop: 8 }}>
              {restaurant.tags} · {restaurant.addressLine} — {restaurant.neighborhood}
            </div>
          </div>
        </div>
      </div>

      <section className="container" style={{ paddingTop: 32, paddingBottom: 56 }}>
        <div className="card" style={{ padding: "20px 24px", marginBottom: 28, display: "grid", gridTemplateColumns: "1fr auto", gap: 24, alignItems: "center" }}>
          <div style={{ display: "flex", gap: 16, alignItems: "center" }}>
            <div style={{ width: 48, height: 48, borderRadius: 12, background: "var(--tomate-50)", color: "var(--tomate-600)", display: "grid", placeItems: "center", flexShrink: 0 }}>
              <Clock size={22} />
            </div>
            <div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 700, color: "var(--ink-800)", letterSpacing: "-0.015em" }}>Horário de funcionamento</div>
              <div style={{ fontSize: 13, color: "var(--fg-2)", marginTop: 2 }}>{restaurant.name} {opening}</div>
            </div>
          </div>
          <div style={{ display: "flex", gap: 18, fontSize: 13, color: "var(--ink-700)", flexWrap: "wrap" }}>
            {schedule.map((row, i) => (
              <div key={i} style={{ display: "flex", flexDirection: "column", alignItems: "flex-start" }}>
                <span style={{ fontSize: 11, fontWeight: 700, color: "var(--fg-2)", letterSpacing: "0.08em", textTransform: "uppercase" }}>{row.label}</span>
                <span className="price" style={{ fontSize: 14, color: row.hoursLabel === "Fechado" ? "var(--fg-3)" : "var(--ink-800)", fontWeight: 600 }}>
                  {row.hoursLabel}
                </span>
              </div>
            ))}
          </div>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "1fr 320px", gap: 32, alignItems: "flex-start" }}>
          <div>
            <h2 style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 800, color: "var(--ink-800)", letterSpacing: "-0.02em", marginBottom: 4 }}>Cardápio</h2>
            <p style={{ fontSize: 13, color: "var(--fg-2)", marginBottom: 18 }}>
              Você pode ver o cardápio agora e fazer o pedido quando {restaurant.name} abrir.
            </p>
            {sections.map((section) => (
              <MenuSectionBlock key={section.id} section={section} onItemClick={() => {}} readOnly />
            ))}
          </div>

          <aside style={{ position: "sticky", top: 100, display: "flex", flexDirection: "column", gap: 16 }}>
            <div className="card" style={{ padding: 22, textAlign: "center" }}>
              <div style={{ width: 64, height: 64, borderRadius: "50%", background: "var(--manga-50)", color: "var(--manga-500)", display: "grid", placeItems: "center", margin: "0 auto 12px" }}>
                <Bell size={28} />
              </div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 800, color: "var(--ink-800)", letterSpacing: "-0.015em" }}>Avisa quando abrir?</div>
              <p style={{ fontSize: 13, color: "var(--fg-2)", marginTop: 6, lineHeight: 1.45 }}>
                A gente ainda não manda esse aviso de verdade — mas {restaurant.name} {opening}.
              </p>
              <button
                type="button"
                className="btn btn-primary btn-block"
                style={{ marginTop: 14 }}
                onClick={() => showToast(`Ainda não mandamos esse aviso — mas anota aí: ${restaurant.name} ${opening}.`)}
              >
                Quero ser avisada
              </button>
            </div>

            {nearbyOpen.length > 0 && (
              <div className="card" style={{ padding: 22 }}>
                <h4 style={{ fontFamily: "var(--font-display)", fontSize: 15, fontWeight: 700, color: "var(--ink-800)", margin: 0, marginBottom: 12 }}>
                  Abertos agora pertinho
                </h4>
                <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 12 }}>
                  {nearbyOpen.map((r) => (
                    <li key={r.id}>
                      <Link href={`/restaurante/${r.slug}`} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", textDecoration: "none" }}>
                        <div>
                          <div style={{ fontSize: 14, fontWeight: 600, color: "var(--ink-800)" }}>{r.name}</div>
                          <div style={{ fontSize: 12, color: "var(--folha-700)", marginTop: 2, display: "flex", alignItems: "center", gap: 5 }}>
                            <span style={{ width: 6, height: 6, borderRadius: "50%", background: "var(--folha-500)" }} /> Pronto em {r.prepTimeMinutes} min
                          </div>
                        </div>
                      </Link>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </aside>
        </div>
      </section>
      <ToastViewport message={message} />
    </>
  );
}
