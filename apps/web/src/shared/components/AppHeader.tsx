"use client";

import { Suspense, useRef, useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Search, ShoppingBag, Store } from "lucide-react";
import { useCart } from "@/modules/cart/context";
import { DEFAULT_NEIGHBORHOOD } from "@/shared/constants";
import { pushRecentSearch } from "@/modules/search/recent-searches";

function HeaderSearchInput() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const inputRef = useRef<HTMLInputElement>(null);
  const initialQuery = pathname === "/busca" ? (searchParams.get("q") ?? "") : "";

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const trimmed = inputRef.current?.value.trim() ?? "";
    if (!trimmed) return;
    pushRecentSearch(trimmed);
    router.push(`/busca?q=${encodeURIComponent(trimmed)}`);
  }

  return (
    <form className="search-bar" onSubmit={handleSubmit} role="search">
      <label
        htmlFor="header-search"
        style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", clip: "rect(0,0,0,0)" }}
      >
        Buscar restaurante, prato ou cozinha
      </label>
      <span className="ico">
        <Search size={16} />
      </span>
      <input
        id="header-search"
        key={`${pathname}?${searchParams.toString()}`}
        ref={inputRef}
        placeholder="Busca restaurante, prato ou cozinha…"
        defaultValue={initialQuery}
      />
    </form>
  );
}

export function AppHeader() {
  const { itemCount, cart } = useCart();
  const [pickupOpen, setPickupOpen] = useState(false);

  return (
    <header className="app-header">
      <div className="inner">
        <Link className="brand" href="/">
          <span className="mark">M</span>
          <span className="word">mandaí</span>
        </Link>

        <div style={{ position: "relative" }}>
          <button
            type="button"
            className="pickup-pill"
            onClick={() => setPickupOpen((v) => !v)}
            aria-expanded={pickupOpen}
          >
            <span className="ico">
              <Store size={14} />
            </span>
            <span className="txt">
              <span className="lbl">Retirar em</span>
              <span className="val">{cart.restaurantName ?? DEFAULT_NEIGHBORHOOD} ▾</span>
            </span>
          </button>
          {pickupOpen && (
            <div
              role="dialog"
              aria-label="Bairro de retirada"
              className="card"
              style={{
                position: "absolute",
                top: "calc(100% + 8px)",
                left: 0,
                width: 260,
                padding: 16,
                zIndex: 20,
              }}
            >
              <p style={{ fontSize: 13, color: "var(--fg-2)", lineHeight: 1.45 }}>
                Por enquanto só rolamos em {DEFAULT_NEIGHBORHOOD} — mais bairros chegando em breve.
              </p>
              <button
                type="button"
                className="btn btn-secondary"
                style={{ marginTop: 10, padding: "8px 14px", fontSize: 13 }}
                onClick={() => setPickupOpen(false)}
              >
                Entendi
              </button>
            </div>
          )}
        </div>

        <Suspense fallback={<div className="search-bar" />}>
          <HeaderSearchInput />
        </Suspense>

        <Link href="/sacola" className="bag-btn">
          <ShoppingBag size={16} />
          <span>Sacola</span>
          {itemCount > 0 && <span className="count">{itemCount}</span>}
        </Link>
      </div>
    </header>
  );
}
