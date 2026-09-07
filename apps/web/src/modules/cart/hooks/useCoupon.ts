"use client";

import { useEffect, useState } from "react";
import { useCart } from "@/modules/cart/context";
import { validateCoupon } from "@/modules/orders/services/coupons.api";
import { ApiError } from "@/shared/lib/api";
import { formatCents } from "@/shared/lib/money";

type CouponState =
  | { status: "idle" }
  | { status: "validating" }
  | { status: "applied"; label: string; discountCents: number }
  | { status: "error"; message: string };

function parseBRLToCents(text: string): number | null {
  const match = text.match(/R\$\s?([\d.,]+)/);
  if (!match) return null;
  const normalized = match[1].replace(/\./g, "").replace(",", ".");
  const value = Number.parseFloat(normalized);
  return Number.isFinite(value) ? Math.round(value * 100) : null;
}

// DP-14: a copy de cada estado do cupom é do PO, não do servidor — o backend
// só devolve `{ statusCode, error, message }` genérico (ADR-0010 descartou
// código de erro semântico), então a UI classifica pela mensagem.
function mapCouponErrorMessage(message: string, subtotalCents: number): string {
  if (/expirou/i.test(message)) {
    return "Esse cupom já venceu — mas sempre tem outro rolando.";
  }
  if (/m[íi]nimo/i.test(message)) {
    const minCents = parseBRLToCents(message);
    if (minCents !== null) {
      const missing = Math.max(0, minCents - subtotalCents);
      return `Faltam ${formatCents(missing)} pro pedido chegar no mínimo de ${formatCents(minCents)} desse cupom.`;
    }
  }
  // "não existe" (404) e "não está mais ativo" (400) caem na mesma copy —
  // pra quem usa, "não existe" e "não vale mais" são a mesma frustração.
  return "Esse cupom não existe ou não vale mais por aqui.";
}

// DP-14: valida no campo (preview) e o servidor recalcula tudo de novo ao
// finalizar (`POST /api/orders`) — se os dois divergirem, vale o de lá.
export function useCoupon(subtotalCents: number) {
  const { cart, setCouponCode } = useCart();
  const [state, setState] = useState<CouponState>({ status: "idle" });

  useEffect(() => {
    let cancelled = false;
    if (!cart.couponCode || subtotalCents === 0) {
      setState({ status: "idle" });
      return;
    }
    setState({ status: "validating" });
    validateCoupon(cart.couponCode, subtotalCents)
      .then((res) => {
        if (!cancelled) setState({ status: "applied", label: res.label, discountCents: res.discountCents });
      })
      .catch(() => {
        if (!cancelled) {
          setCouponCode(undefined);
          setState({ status: "idle" });
        }
      });
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [cart.couponCode, subtotalCents]);

  async function apply(code: string) {
    const trimmed = code.trim();
    if (!trimmed) return;
    setState({ status: "validating" });
    try {
      const res = await validateCoupon(trimmed, subtotalCents);
      setCouponCode(res.code);
      setState({ status: "applied", label: res.label, discountCents: res.discountCents });
    } catch (err) {
      const message =
        err instanceof ApiError ? mapCouponErrorMessage(err.message, subtotalCents) : "Não deu pra validar o cupom agora.";
      setState({ status: "error", message });
    }
  }

  function remove() {
    setCouponCode(undefined);
    setState({ status: "idle" });
  }

  const discountCents = state.status === "applied" ? state.discountCents : 0;

  return { state, discountCents, apply, remove, appliedCode: cart.couponCode };
}
