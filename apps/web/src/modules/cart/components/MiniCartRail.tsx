"use client";

import Link from "next/link";
import { ArrowRight, Store } from "lucide-react";
import { useCart } from "@/modules/cart/context";
import { cartSubtotalCents, lineTotalCents } from "@/modules/cart/types";
import { formatCents } from "@/shared/lib/money";

export function MiniCartRail() {
  const { cart, hydrated } = useCart();

  return (
    <aside>
      <div style={{ position: "sticky", top: 100 }}>
        <div className="card" style={{ padding: 20 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <h3 style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 700, color: "var(--ink-800)" }}>Sua sacola</h3>
            {hydrated && cart.items.length > 0 && (
              <span style={{ fontSize: 13, color: "var(--fg-2)" }}>{cart.items.length} itens</span>
            )}
          </div>

          {!hydrated || cart.items.length === 0 ? (
            <p style={{ fontSize: 14, color: "var(--fg-2)" }}>Ainda não tem nada aqui. Escolhe um prato ao lado.</p>
          ) : (
            <>
              <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                {cart.items.map((it) => (
                  <div key={it.lineId} style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                    <span
                      style={{
                        background: "var(--ink-100)",
                        color: "var(--ink-700)",
                        padding: "2px 8px",
                        borderRadius: 6,
                        fontSize: 12,
                        fontFamily: "var(--font-mono)",
                        fontWeight: 600,
                        minWidth: 24,
                        textAlign: "center",
                      }}
                    >
                      {it.qty}×
                    </span>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontSize: 14, fontWeight: 600, color: "var(--ink-800)" }}>{it.name}</div>
                      <div className="price" style={{ fontSize: 13, color: "var(--fg-2)", marginTop: 2 }}>
                        {formatCents(lineTotalCents(it))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <hr className="divider" />
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
                <span style={{ fontSize: 13, color: "var(--fg-2)" }}>Subtotal</span>
                <span className="price" style={{ fontSize: 18, color: "var(--ink-800)" }}>
                  {formatCents(cartSubtotalCents(cart))}
                </span>
              </div>
              <Link href="/sacola" className="btn btn-primary btn-block" style={{ marginTop: 16 }}>
                Ver sacola <ArrowRight size={14} />
              </Link>
            </>
          )}
          <div style={{ fontSize: 12, color: "var(--fg-2)", textAlign: "center", marginTop: 10, display: "inline-flex", alignItems: "center", justifyContent: "center", gap: 6, width: "100%" }}>
            <Store size={12} /> Retirada no balcão · sem taxa
          </div>
        </div>
      </div>
    </aside>
  );
}
