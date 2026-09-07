"use client";

import { useState } from "react";
import { AlertTriangle, Copy, CreditCard, Repeat, Store, Wifi } from "lucide-react";

// US-09, tela 10 — exclusiva da falha técnica ao enviar o pedido (DP-19).
// Falha de regra de negócio (ex.: restaurante fechou) usa mensagem inline,
// não esta tela — ver `CheckoutFlow`.
export function OrderErrorScreen({ code, onRetry, onBackToCart }: { code: string; onRetry: () => void; onBackToCart: () => void }) {
  const [copied, setCopied] = useState(false);

  function copyCode() {
    navigator.clipboard?.writeText(code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  return (
    <div style={{ maxWidth: 860, margin: "0 auto" }}>
      <div className="card" style={{ padding: "48px 56px" }}>
        <div style={{ display: "flex", gap: 28, alignItems: "flex-start" }}>
          <div style={{ width: 96, height: 96, borderRadius: "50%", background: "var(--tomate-50)", color: "var(--tomate-500)", display: "grid", placeItems: "center", flexShrink: 0 }}>
            <AlertTriangle size={44} strokeWidth={2} />
          </div>
          <div style={{ flex: 1 }}>
            <div className="eyebrow" style={{ color: "var(--tomate-600)" }}>
              Algo deu errado
            </div>
            <h1 style={{ fontFamily: "var(--font-display)", fontSize: 36, fontWeight: 800, color: "var(--ink-800)", letterSpacing: "-0.03em", lineHeight: 1.05, marginTop: 6 }}>
              Ih, deu ruim aqui.
            </h1>
            <p style={{ fontSize: 15, color: "var(--fg-2)", marginTop: 10, maxWidth: 520, lineHeight: 1.5 }}>
              A gente não conseguiu enviar seu pedido agora. Pode ser a internet ou um problema rápido do nosso lado.{" "}
              <strong style={{ color: "var(--ink-800)" }}>Seu rango tá salvo</strong> — só tentar de novo.
            </p>

            <div style={{ marginTop: 22, padding: "14px 18px", background: "var(--bg-page)", borderRadius: "var(--r-sm)", border: "1px solid var(--border-1)", display: "flex", alignItems: "center", gap: 14 }}>
              <span style={{ flex: 1, fontSize: 13, color: "var(--ink-700)" }}>
                <span style={{ fontWeight: 600 }}>Código do erro:</span> <span style={{ fontFamily: "var(--font-mono)", color: "var(--ink-800)" }}>{code}</span>
              </span>
              <button type="button" onClick={copyCode} style={{ background: "transparent", border: 0, color: "var(--tomate-600)", fontWeight: 600, fontSize: 12, cursor: "pointer", display: "inline-flex", alignItems: "center", gap: 6 }}>
                <Copy size={13} /> {copied ? "Copiado!" : "Copiar"}
              </button>
            </div>

            <div style={{ display: "flex", gap: 12, marginTop: 26, flexWrap: "wrap" }}>
              <button type="button" className="btn btn-primary" style={{ padding: "14px 26px", fontSize: 15 }} onClick={onRetry}>
                <Repeat size={15} /> Tentar de novo
              </button>
              <button type="button" className="btn btn-secondary" style={{ padding: "14px 22px", fontSize: 14 }} onClick={onBackToCart}>
                Voltar pra sacola
              </button>
            </div>
          </div>
        </div>
      </div>

      <div style={{ marginTop: 24, display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 14 }}>
        {[
          { icon: Wifi, label: "Sua conexão", value: "Conectada", color: "folha" },
          { icon: Store, label: "Restaurante", value: "Verificando…", color: "manga" },
          { icon: CreditCard, label: "Pedido salvo", value: "OK, sem perda", color: "folha" },
        ].map((s) => (
          <div key={s.label} className="card" style={{ padding: "16px 18px", display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 36, height: 36, borderRadius: 10, background: `var(--${s.color}-50)`, color: `var(--${s.color}-600)`, display: "grid", placeItems: "center" }}>
              <s.icon size={16} />
            </div>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: "var(--fg-2)", letterSpacing: "0.06em", textTransform: "uppercase" }}>{s.label}</div>
              <div style={{ fontSize: 13, color: `var(--${s.color}-700)`, fontWeight: 600, marginTop: 2 }}>{s.value}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
