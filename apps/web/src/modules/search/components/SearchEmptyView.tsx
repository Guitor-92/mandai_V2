"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Search as SearchIcon } from "lucide-react";
import { CATEGORIES, DEFAULT_NEIGHBORHOOD } from "@/shared/constants";
import { getRecentSearches } from "@/modules/search/recent-searches";
import { useToast, ToastViewport } from "@/shared/components/Toast";

export function SearchEmptyView({ query }: { query: string }) {
  const [recent, setRecent] = useState<string[]>([]);
  const { message, showToast } = useToast();

  useEffect(() => {
    setRecent(getRecentSearches().filter((r) => r.toLowerCase() !== query.toLowerCase()));
  }, [query]);

  return (
    <section className="container" style={{ paddingTop: 28, paddingBottom: 56 }}>
      <div style={{ marginBottom: 30 }}>
        <div className="eyebrow" style={{ color: "var(--fg-2)" }}>
          Resultados da busca
        </div>
        <h1
          style={{
            fontFamily: "var(--font-display)",
            fontSize: 40,
            fontWeight: 800,
            color: "var(--ink-800)",
            letterSpacing: "-0.03em",
            lineHeight: 1,
            marginTop: 6,
          }}
        >
          &quot;{query}&quot; em {DEFAULT_NEIGHBORHOOD}
        </h1>
        <div style={{ fontSize: 14, color: "var(--fg-2)", marginTop: 8 }}>
          Nenhum restaurante ou prato bateu por aqui — mas a gente tem ideia.
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 300px", gap: 32, alignItems: "flex-start" }}>
        <div>
          <div className="card" style={{ padding: "48px 40px", textAlign: "center" }}>
            <div
              style={{
                width: 110,
                height: 110,
                borderRadius: "50%",
                background: "var(--tomate-50)",
                margin: "0 auto",
                display: "grid",
                placeItems: "center",
              }}
            >
              <SearchIcon size={48} color="var(--tomate-500)" strokeWidth={1.5} />
            </div>
            <h2
              style={{
                fontFamily: "var(--font-display)",
                fontSize: 28,
                fontWeight: 800,
                color: "var(--ink-800)",
                letterSpacing: "-0.025em",
                lineHeight: 1.05,
                margin: 0,
                marginTop: 22,
              }}
            >
              Esse rango não tá no bairro
              <br />
              (ainda!)
            </h2>
            <p style={{ fontSize: 15, color: "var(--fg-2)", marginTop: 12, maxWidth: 460, marginLeft: "auto", marginRight: "auto", lineHeight: 1.5 }}>
              Não achei nada com <strong style={{ color: "var(--ink-800)" }}>&quot;{query}&quot;</strong> em{" "}
              {DEFAULT_NEIGHBORHOOD}. Tenta uma busca mais ampla ou olha as categorias.
            </p>

            <div style={{ marginTop: 22 }}>
              <div style={{ fontSize: 11, fontWeight: 700, color: "var(--ink-500)", letterSpacing: "0.1em", textTransform: "uppercase", marginBottom: 10 }}>
                Categorias
              </div>
              <div style={{ display: "flex", gap: 8, justifyContent: "center", flexWrap: "wrap" }}>
                {CATEGORIES.map((c) => (
                  <Link
                    key={c.slug}
                    href={`/categoria/${c.slug}`}
                    style={{
                      display: "inline-flex",
                      alignItems: "center",
                      gap: 8,
                      padding: "10px 14px",
                      background: "var(--bg-page)",
                      border: "1px solid var(--border-2)",
                      borderRadius: 999,
                      fontSize: 13,
                      color: "var(--ink-800)",
                      fontWeight: 600,
                      textDecoration: "none",
                    }}
                  >
                    {c.emoji} {c.label}
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </div>

        <aside style={{ display: "flex", flexDirection: "column", gap: 14 }}>
          {recent.length > 0 && (
            <div className="card" style={{ padding: 22 }}>
              <h4 style={{ fontFamily: "var(--font-display)", fontSize: 15, fontWeight: 700, color: "var(--ink-800)", margin: 0, marginBottom: 12 }}>
                Buscas recentes
              </h4>
              <div style={{ display: "flex", flexDirection: "column" }}>
                {recent.map((r, i) => (
                  <Link
                    key={r}
                    href={`/busca?q=${encodeURIComponent(r)}`}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: 8,
                      fontSize: 13,
                      color: "var(--ink-700)",
                      textDecoration: "none",
                      padding: "10px 0",
                      borderTop: i === 0 ? 0 : "1px solid var(--border-1)",
                    }}
                  >
                    <SearchIcon size={12} color="var(--fg-3)" />
                    {r}
                  </Link>
                ))}
              </div>
            </div>
          )}

          <div style={{ padding: "14px 16px", background: "var(--manga-50)", borderRadius: "var(--r-md)", display: "flex", gap: 10, alignItems: "flex-start" }}>
            <div style={{ fontSize: 12, color: "var(--ink-800)", lineHeight: 1.45 }}>
              Sentiu falta de algum lugar?{" "}
              <button
                type="button"
                onClick={() => showToast("Ainda não temos esse formulário de pé. Mas valeu a lembrança!")}
                style={{ background: "none", border: 0, padding: 0, color: "var(--tomate-600)", fontWeight: 600, cursor: "pointer", font: "inherit" }}
              >
                Indica um restaurante
              </button>{" "}
              que a gente corre atrás.
            </div>
          </div>
        </aside>
      </div>
      <ToastViewport message={message} />
    </section>
  );
}
