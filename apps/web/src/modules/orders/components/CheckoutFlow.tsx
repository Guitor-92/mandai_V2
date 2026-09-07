"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ChevronLeft } from "lucide-react";
import { useCart } from "@/modules/cart/context";
import { cartSubtotalCents } from "@/modules/cart/types";
import { useCoupon } from "@/modules/cart/hooks/useCoupon";
import { createOrder } from "@/modules/orders/services/orders.api";
import { pushRecentOrder } from "@/modules/orders/recent-orders";
import { OrderErrorScreen } from "@/modules/orders/components/OrderErrorScreen";
import { ApiError } from "@/shared/lib/api";
import { formatCents } from "@/shared/lib/money";

type Failure =
  | { type: "business"; variant: "closed" | "generic"; message: string }
  | { type: "technical"; code: string };

// P-02 (docs/qa/respostas-po.md): o servidor sempre revalida `isOpen` ao
// finalizar. Se o restaurante fechou enquanto a pessoa decidia, a copy é
// específica do PO — não a mensagem crua do backend.
function isRestaurantClosedMessage(message: string): boolean {
  return /fechad/i.test(message);
}

export function CheckoutFlow({ onBack }: { onBack: () => void }) {
  const router = useRouter();
  const { cart, clear } = useCart();
  const subtotalCents = cartSubtotalCents(cart);
  const coupon = useCoupon(subtotalCents);
  const totalCents = Math.max(0, subtotalCents - coupon.discountCents);

  const [name, setName] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [failure, setFailure] = useState<Failure | null>(null);
  const [attempted, setAttempted] = useState(false);

  const nameValid = name.trim().length >= 2 && name.trim().length <= 60;

  async function handleSubmit() {
    setAttempted(true);
    if (!nameValid || !cart.restaurantSlug) return;
    setSubmitting(true);
    setFailure(null);
    try {
      const order = await createOrder({
        restaurantSlug: cart.restaurantSlug,
        customerName: name.trim(),
        couponCode: cart.couponCode,
        items: cart.items.map((item) => ({
          menuItemId: item.menuItemId,
          qty: item.qty,
          selectedOptionIds: item.modifiers.map((m) => m.optionId),
          note: item.note,
        })),
      });
      pushRecentOrder({
        code: order.code,
        restaurantSlug: cart.restaurantSlug,
        restaurantName: order.restaurant.name,
        createdAt: order.createdAt,
      });
      clear();
      router.push(`/pedido/${order.code}`);
    } catch (err) {
      if (err instanceof ApiError && err.statusCode < 500) {
        if (isRestaurantClosedMessage(err.message)) {
          setFailure({
            type: "business",
            variant: "closed",
            message: `${cart.restaurantName} fechou enquanto você decidia. Sua sacola tá salva — dá uma olhada em outro lugar aberto.`,
          });
        } else {
          setFailure({ type: "business", variant: "generic", message: err.message });
        }
      } else {
        setFailure({ type: "technical", code: err instanceof ApiError ? `HTTP_${err.statusCode}` : "NETWORK_ERROR" });
      }
    } finally {
      setSubmitting(false);
    }
  }

  if (failure?.type === "technical") {
    return (
      <section className="container" style={{ paddingTop: 64, paddingBottom: 80 }}>
        <OrderErrorScreen code={failure.code} onRetry={() => setFailure(null)} onBackToCart={onBack} />
      </section>
    );
  }

  return (
    <section className="container" style={{ paddingTop: 32, paddingBottom: 56 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, fontSize: 13, color: "var(--fg-2)", marginBottom: 14 }}>
        <button type="button" onClick={onBack} style={{ background: "transparent", border: 0, color: "var(--fg-2)", display: "inline-flex", alignItems: "center", gap: 4, cursor: "pointer", padding: 0, font: "inherit" }}>
          <ChevronLeft size={13} /> Voltar pra sacola
        </button>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 380px", gap: 32, alignItems: "flex-start", maxWidth: 1120, margin: "0 auto" }}>
        <div>
          <h1 style={{ fontFamily: "var(--font-display)", fontSize: 36, fontWeight: 800, color: "var(--ink-800)", letterSpacing: "-0.03em", lineHeight: 1 }}>
            Falta só seu nome
          </h1>
          <p style={{ fontSize: 15, color: "var(--fg-2)", marginTop: 8 }}>
            A gente usa só pra gerar o código que você apresenta no balcão na hora de retirar.
          </p>
          <div className="card" style={{ padding: 28, marginTop: 24 }}>
            <label htmlFor="customer-name" style={{ fontSize: 13, fontWeight: 700, color: "var(--ink-700)", letterSpacing: "0.04em", textTransform: "uppercase" }}>
              Seu nome
            </label>
            <input
              id="customer-name"
              autoFocus
              value={name}
              maxLength={60}
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSubmit();
              }}
              style={{
                display: "block",
                width: "100%",
                boxSizing: "border-box",
                background: "var(--bg-surface)",
                border: attempted && !nameValid ? "1.5px solid var(--danger)" : "1.5px solid var(--tomate-500)",
                borderRadius: "var(--r-sm)",
                padding: "14px 16px",
                marginTop: 10,
                fontFamily: "var(--font-body)",
                fontSize: 16,
                fontWeight: 500,
                color: "var(--ink-800)",
                outline: "none",
                boxShadow: "0 0 0 3px var(--tomate-50)",
              }}
            />
            {attempted && !nameValid && (
              <p style={{ fontSize: 13, color: "var(--danger)", marginTop: 8 }}>
                Escreve seu nome (pelo menos 2 letrinhas) pra gente te chamar no balcão.
              </p>
            )}
            {failure?.type === "business" && (
              <div style={{ marginTop: 12 }}>
                <p style={{ fontSize: 13, color: "var(--danger)", lineHeight: 1.5 }}>{failure.message}</p>
                {failure.variant === "closed" && (
                  <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
                    <Link href="/" className="btn btn-secondary" style={{ padding: "10px 16px", fontSize: 13 }}>
                      Voltar pra Home
                    </Link>
                    <button type="button" className="btn btn-secondary" style={{ padding: "10px 16px", fontSize: 13 }} onClick={onBack}>
                      Voltar pra sacola
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
        <aside>
          <div className="card" style={{ padding: 24 }}>
            <h3 style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 700 }}>Total</h3>
            <div className="price" style={{ fontSize: 28, fontWeight: 700, color: "var(--ink-800)", marginTop: 4 }}>
              {formatCents(totalCents)}
            </div>
            <button
              type="button"
              className="btn btn-primary btn-block"
              style={{ marginTop: 18, opacity: submitting ? 0.7 : 1 }}
              disabled={submitting}
              onClick={handleSubmit}
            >
              {submitting ? "Confirmando…" : "Confirmar pedido"}
            </button>
          </div>
        </aside>
      </div>
    </section>
  );
}
