"use client";

import { useRef } from "react";
import { Bell, Package, X } from "lucide-react";
import { useFocusTrap } from "@/shared/lib/useFocusTrap";

// P-03: item OUT_OF_STOCK nunca abre o modal de customização — abre este,
// explicativo, com o botão "Me avisa quando voltar" (DP-17, vira toast).
export function OutOfStockModal({
  itemName,
  restaurantName,
  onClose,
  onNotify,
}: {
  itemName: string;
  restaurantName: string;
  onClose: () => void;
  onNotify: () => void;
}) {
  const ref = useRef<HTMLDivElement>(null);
  useFocusTrap(ref, onClose);

  return (
    <div role="presentation" onClick={onClose} style={{ position: "fixed", inset: 0, background: "rgba(28,24,18,0.45)", zIndex: 100, display: "grid", placeItems: "center" }}>
      <div
        ref={ref}
        role="dialog"
        aria-modal="true"
        aria-labelledby="out-of-stock-title"
        onClick={(e) => e.stopPropagation()}
        className="card"
        style={{ width: 440, padding: 28, textAlign: "center", position: "relative" }}
      >
        <button
          type="button"
          aria-label="Fechar"
          onClick={onClose}
          style={{ position: "absolute", top: 14, right: 14, background: "transparent", border: 0, color: "var(--fg-3)", cursor: "pointer", padding: 6 }}
        >
          <X size={18} />
        </button>

        <div style={{ width: 72, height: 72, borderRadius: "50%", background: "var(--manga-50)", color: "var(--manga-500)", display: "grid", placeItems: "center", margin: "0 auto 14px" }}>
          <Package size={32} />
        </div>
        <h3 id="out-of-stock-title" style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 800, color: "var(--ink-800)", letterSpacing: "-0.02em", marginBottom: 8 }}>
          Esgotou agora mesmo, viu
        </h3>
        <p style={{ fontSize: 14, color: "var(--fg-2)", lineHeight: 1.5, marginBottom: 20 }}>
          O <strong style={{ color: "var(--ink-800)" }}>{itemName}</strong> acabou na {restaurantName}. A gente pode te
          avisar quando voltar a ter.
        </p>

        <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
          <button type="button" className="btn btn-secondary" style={{ padding: "12px 18px", fontSize: 14 }} onClick={onClose}>
            Escolher outro
          </button>
          <button type="button" className="btn btn-primary" style={{ padding: "12px 18px", fontSize: 14 }} onClick={onNotify}>
            <Bell size={14} /> Me avisa quando voltar
          </button>
        </div>
      </div>
    </div>
  );
}
