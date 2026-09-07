"use client";

import { useCart } from "@/modules/cart/context";

// US-10 / DP-21 — sem tela desenhada no handoff; copy escrita seguindo o tom
// do resto do produto (coloquial paulistano). Dispara no clique que abriria o
// modal de customização de um item de outro restaurante, com a sacola não
// vazia — antes de a pessoa escolher acompanhamentos e adicionais.
export function ChangeRestaurantDialog() {
  const { pendingConflict, confirmReplace, cancelConflict } = useCart();

  if (!pendingConflict) return null;

  return (
    <div
      role="presentation"
      onClick={cancelConflict}
      style={{
        position: "fixed",
        inset: 0,
        background: "rgba(28,24,18,0.45)",
        display: "grid",
        placeItems: "center",
        zIndex: 100,
      }}
    >
      <div
        role="alertdialog"
        aria-modal="true"
        aria-labelledby="change-restaurant-title"
        onClick={(e) => e.stopPropagation()}
        className="card"
        style={{ width: 440, padding: 28, textAlign: "center" }}
      >
        <h3
          id="change-restaurant-title"
          style={{
            fontFamily: "var(--font-display)",
            fontSize: 22,
            fontWeight: 800,
            color: "var(--ink-800)",
            letterSpacing: "-0.02em",
            marginBottom: 10,
          }}
        >
          Trocar de restaurante?
        </h3>
        <p style={{ fontSize: 14, color: "var(--fg-2)", lineHeight: 1.5, marginBottom: 22 }}>
          Sua sacola tem itens de <strong style={{ color: "var(--ink-800)" }}>{pendingConflict.fromRestaurant}</strong>.
          Pra pedir de <strong style={{ color: "var(--ink-800)" }}>{pendingConflict.toRestaurant}</strong>, a gente
          esvazia a sacola e começa do zero.
        </p>
        <div style={{ display: "flex", gap: 10, justifyContent: "center", flexWrap: "wrap" }}>
          <button type="button" className="btn btn-secondary" style={{ padding: "12px 18px", fontSize: 14 }} onClick={cancelConflict}>
            Continuar em {pendingConflict.fromRestaurant}
          </button>
          <button type="button" className="btn btn-primary" style={{ padding: "12px 18px", fontSize: 14 }} onClick={confirmReplace}>
            Esvaziar e trocar
          </button>
        </div>
      </div>
    </div>
  );
}
