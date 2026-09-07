"use client";

import { useState } from "react";
import Link from "next/link";
import Image from "next/image";
import { ChevronLeft, Info, Minus, Plus, Ticket, Trash2 } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { useCart } from "@/modules/cart/context";
import { cartSubtotalCents, lineTotalCents } from "@/modules/cart/types";
import { useCoupon } from "@/modules/cart/hooks/useCoupon";
import { AddItemModal } from "@/modules/cart/components/AddItemModal";
import { getRestaurantBySlug } from "@/modules/restaurants/services/restaurants.api";
import { formatCents } from "@/shared/lib/money";

export function CartView({ onFinish }: { onFinish: () => void }) {
  const { cart, setQty, removeLine, updateLine } = useCart();
  const [editingLineId, setEditingLineId] = useState<string | null>(null);

  const subtotalCents = cartSubtotalCents(cart);
  const coupon = useCoupon(subtotalCents);
  const totalCents = Math.max(0, subtotalCents - coupon.discountCents);

  const { data: restaurant } = useQuery({
    queryKey: ["restaurant-detail", cart.restaurantSlug],
    queryFn: () => getRestaurantBySlug(cart.restaurantSlug as string),
    enabled: !!cart.restaurantSlug,
  });

  const editingLine = cart.items.find((i) => i.lineId === editingLineId);
  const editingMenuItem = restaurant?.sections.flatMap((s) => s.items).find((i) => i.id === editingLine?.menuItemId);

  const [couponInput, setCouponInput] = useState("");

  return (
    <section className="container" style={{ paddingTop: 32, paddingBottom: 56 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--fg-2)", marginBottom: 14 }}>
        <Link href={`/restaurante/${cart.restaurantSlug}`} style={{ color: "var(--fg-2)", display: "inline-flex", alignItems: "center", gap: 4, textDecoration: "none" }}>
          <ChevronLeft size={13} /> Continuar comprando
        </Link>
      </div>
      <h1 style={{ fontFamily: "var(--font-display)", fontSize: 40, fontWeight: 800, color: "var(--ink-800)", letterSpacing: "-0.03em", lineHeight: 1 }}>
        Sua sacola
      </h1>
      <div style={{ fontSize: 15, color: "var(--fg-2)", marginTop: 8 }}>
        {cart.items.length} {cart.items.length === 1 ? "item" : "itens"} da{" "}
        <span style={{ color: "var(--ink-700)", fontWeight: 600 }}>{cart.restaurantName}</span>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: 32, marginTop: 32, alignItems: "flex-start" }}>
        <div>
          <div className="card" style={{ padding: 0 }}>
            {cart.items.map((it, i) => (
              <div
                key={it.lineId}
                style={{ padding: "20px 24px", borderBottom: i < cart.items.length - 1 ? "1px solid var(--border-1)" : 0, display: "flex", gap: 18, alignItems: "flex-start" }}
              >
                <div style={{ width: 84, height: 84, borderRadius: "var(--r-md)", position: "relative", flexShrink: 0, overflow: "hidden" }}>
                  <Image src={it.imageUrl} alt="" fill sizes="84px" style={{ objectFit: "cover" }} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12 }}>
                    <div>
                      <div style={{ fontFamily: "var(--font-display)", fontSize: 17, fontWeight: 700, color: "var(--ink-800)", letterSpacing: "-0.01em" }}>
                        {it.name}
                      </div>
                      {it.modifiers.length > 0 && (
                        <ul style={{ listStyle: "none", padding: 0, margin: "6px 0 0", display: "flex", flexDirection: "column", gap: 2 }}>
                          {it.modifiers.map((m) => (
                            <li key={m.optionId} style={{ fontSize: 13, color: "var(--fg-2)" }}>
                              {m.groupName}: {m.optionName}
                            </li>
                          ))}
                        </ul>
                      )}
                      {it.note && (
                        <div style={{ fontSize: 13, color: "var(--ink-600)", marginTop: 6, fontStyle: "italic", display: "inline-flex", alignItems: "center", gap: 6 }}>
                          <Info size={12} color="var(--fg-3)" /> {it.note}
                        </div>
                      )}
                      <button
                        type="button"
                        onClick={() => setEditingLineId(it.lineId)}
                        style={{ background: "transparent", border: 0, padding: 0, marginTop: 10, color: "var(--tomate-600)", fontSize: 13, fontWeight: 600, cursor: "pointer" }}
                      >
                        Editar item
                      </button>
                    </div>
                    <button
                      type="button"
                      aria-label={`Remover ${it.name}`}
                      onClick={() => removeLine(it.lineId)}
                      style={{ background: "transparent", border: 0, color: "var(--ink-500)", cursor: "pointer", padding: 6 }}
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 12 }}>
                    <div style={{ display: "inline-flex", alignItems: "center", gap: 4, background: "var(--bg-page)", borderRadius: 999, padding: 3, border: "1px solid var(--border-2)" }}>
                      <button
                        type="button"
                        aria-label="Diminuir quantidade"
                        onClick={() => (it.qty <= 1 ? removeLine(it.lineId) : setQty(it.lineId, it.qty - 1))}
                        style={{ width: 30, height: 30, borderRadius: "50%", background: "transparent", border: 0, color: "var(--ink-700)", cursor: "pointer", display: "grid", placeItems: "center" }}
                      >
                        <Minus size={14} />
                      </button>
                      <span style={{ minWidth: 22, textAlign: "center", fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: 14, color: "var(--ink-800)" }}>{it.qty}</span>
                      <button
                        type="button"
                        aria-label="Aumentar quantidade"
                        disabled={it.qty >= 20}
                        onClick={() => setQty(it.lineId, it.qty + 1)}
                        style={{ width: 30, height: 30, borderRadius: "50%", background: "var(--tomate-500)", border: 0, color: "var(--white)", cursor: "pointer", display: "grid", placeItems: "center" }}
                      >
                        <Plus size={14} strokeWidth={2.5} />
                      </button>
                    </div>
                    <span className="price" style={{ fontSize: 16, color: "var(--ink-800)" }}>
                      {formatCents(lineTotalCents(it))}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div style={{ marginTop: 16, display: "flex", justifyContent: "center" }}>
            <Link href={`/restaurante/${cart.restaurantSlug}`} className="btn btn-secondary" style={{ padding: "12px 22px", fontSize: 14 }}>
              <Plus size={14} /> Adicionar mais itens
            </Link>
          </div>
        </div>

        <aside style={{ position: "sticky", top: 100 }}>
          <div className="card" style={{ padding: 24 }}>
            <h3 style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 700, color: "var(--ink-800)", letterSpacing: "-0.02em" }}>
              Resumo do pedido
            </h3>

            {coupon.appliedCode ? (
              <div style={{ marginTop: 18, display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 14px", background: "var(--folha-50)", borderRadius: "var(--r-sm)" }}>
                <span style={{ fontSize: 13, color: "var(--folha-700)", fontWeight: 600 }}>Cupom {coupon.appliedCode} aplicado</span>
                <button type="button" onClick={coupon.remove} style={{ background: "transparent", border: 0, color: "var(--folha-700)", fontSize: 12, fontWeight: 700, cursor: "pointer" }}>
                  Remover
                </button>
              </div>
            ) : (
              <div style={{ marginTop: 18 }}>
                <div style={{ display: "flex", gap: 8 }}>
                  <div style={{ flex: 1, position: "relative" }}>
                    <span style={{ position: "absolute", left: 12, top: "50%", transform: "translateY(-50%)", color: "var(--manga-400)" }}>
                      <Ticket size={16} />
                    </span>
                    <label htmlFor="coupon-code" style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0,0,0,0)" }}>
                      Código do cupom
                    </label>
                    <input
                      id="coupon-code"
                      placeholder="Código do cupom"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value)}
                      style={{
                        width: "100%",
                        boxSizing: "border-box",
                        background: "var(--bg-surface)",
                        border: "1px solid var(--border-2)",
                        borderRadius: "var(--r-sm)",
                        padding: "11px 14px 11px 38px",
                        fontFamily: "var(--font-body)",
                        fontSize: 13,
                        color: "var(--ink-800)",
                        outline: "none",
                      }}
                    />
                  </div>
                  <button
                    type="button"
                    className="btn btn-secondary"
                    style={{ padding: "11px 18px", fontSize: 13 }}
                    disabled={coupon.state.status === "validating"}
                    onClick={() => coupon.apply(couponInput)}
                  >
                    {coupon.state.status === "validating" ? "Aplicando…" : "Aplicar"}
                  </button>
                </div>
                {coupon.state.status === "error" && (
                  <p style={{ fontSize: 12, color: "var(--danger)", marginTop: 8 }}>{coupon.state.message}</p>
                )}
              </div>
            )}

            <hr className="divider" />

            <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
              <Row label="Subtotal" value={formatCents(subtotalCents)} />
              <Row label="Taxa de retirada" value="Grátis" valueColor="var(--folha-600)" />
              {coupon.state.status === "applied" && (
                <Row label={`Cupom ${coupon.appliedCode}`} value={`− ${formatCents(coupon.discountCents)}`} valueColor="var(--tomate-600)" />
              )}
            </div>

            <hr className="divider" />

            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
              <span style={{ fontFamily: "var(--font-display)", fontSize: 17, fontWeight: 700, color: "var(--ink-800)" }}>Total</span>
              <span className="price" style={{ fontSize: 26, fontWeight: 700, color: "var(--ink-800)" }}>
                {formatCents(totalCents)}
              </span>
            </div>
            <div style={{ fontSize: 12, color: "var(--fg-2)", textAlign: "right", marginTop: 4 }}>Pagamento direto no balcão</div>

            <button type="button" className="btn btn-primary btn-block" style={{ marginTop: 20 }} onClick={onFinish}>
              Finalizar pedido
            </button>

            <div style={{ marginTop: 16, padding: "12px 14px", background: "var(--folha-50)", borderRadius: "var(--r-sm)", display: "flex", gap: 10, alignItems: "flex-start" }}>
              <div style={{ color: "var(--folha-700)", marginTop: 1 }}>
                <Info size={16} />
              </div>
              <div style={{ fontSize: 12, color: "var(--folha-800)", lineHeight: 1.45 }}>
                <strong>Sem cadastro.</strong> A gente só vai pedir seu nome pra gerar o código que você apresenta no balcão.
              </div>
            </div>
          </div>
        </aside>
      </div>

      {editingLine && editingMenuItem && (
        <AddItemModal
          item={editingMenuItem}
          confirmLabel="Salvar alterações"
          initial={{
            qty: editingLine.qty,
            selectedOptionIds: editingLine.modifiers.map((m) => m.optionId),
            note: editingLine.note,
          }}
          onClose={() => setEditingLineId(null)}
          onConfirm={({ qty, modifiers, note }) => {
            updateLine(editingLine.lineId, {
              menuItemId: editingMenuItem.id,
              name: editingMenuItem.name,
              imageUrl: editingMenuItem.imageUrl,
              unitPriceCents: editingMenuItem.priceCents,
              qty,
              modifiers,
              note,
            });
            setEditingLineId(null);
          }}
        />
      )}
    </section>
  );
}

function Row({ label, value, valueColor }: { label: string; value: string; valueColor?: string }) {
  return (
    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
      <span style={{ fontSize: 14, color: "var(--fg-2)" }}>{label}</span>
      <span className="price" style={{ fontSize: 15, color: valueColor ?? "var(--ink-800)", fontWeight: 600 }}>
        {value}
      </span>
    </div>
  );
}
