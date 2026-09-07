"use client";

import { useState } from "react";
import { useCart } from "@/modules/cart/context";
import { CartView } from "@/modules/cart/components/CartView";
import { EmptyCartView } from "@/modules/cart/components/EmptyCartView";
import { CheckoutFlow } from "@/modules/orders/components/CheckoutFlow";

export default function CartPage() {
  const { cart, hydrated } = useCart();
  const [step, setStep] = useState<"cart" | "checkout">("cart");

  if (!hydrated) return null;
  if (cart.items.length === 0) return <EmptyCartView />;
  if (step === "checkout") return <CheckoutFlow onBack={() => setStep("cart")} />;
  return <CartView onFinish={() => setStep("checkout")} />;
}
