"use client";

import { useRef, useState } from "react";
import Link from "next/link";
import { QRCodeCanvas } from "qrcode.react";
import { Check, Copy, Download, MapPin, Phone, Share2 } from "lucide-react";
import type { Order } from "@/shared/types";
import { formatCents } from "@/shared/lib/money";

export function OrderConfirmationView({ order }: { order: Order }) {
  const [copied, setCopied] = useState(false);
  const qrRef = useRef<HTMLDivElement>(null);

  const restaurantName = order.restaurant.name;
  const prepMinutes = Math.max(
    1,
    Math.round((new Date(order.estimatedReadyAt).getTime() - new Date(order.createdAt).getTime()) / 60_000),
  );

  function copyCode() {
    navigator.clipboard?.writeText(order.code).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }

  function downloadQr() {
    const canvas = qrRef.current?.querySelector("canvas");
    if (!canvas) return;
    const link = document.createElement("a");
    link.download = `mandai-${order.code}.png`;
    link.href = canvas.toDataURL("image/png");
    link.click();
  }

  const whatsappText = encodeURIComponent(
    `Meu pedido no Mandaí em ${restaurantName} tá confirmado! Código: ${order.code}`,
  );

  return (
    <div style={{ maxWidth: 1120, margin: "0 auto" }}>
      <div style={{ display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 32, alignItems: "stretch" }}>
        <div
          style={{
            background: "var(--ink-800)",
            color: "var(--white)",
            borderRadius: "var(--r-xl)",
            padding: "40px 44px",
            position: "relative",
            overflow: "hidden",
            boxShadow: "var(--shadow-3)",
            display: "flex",
            flexDirection: "column",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
            <div style={{ width: 44, height: 44, borderRadius: "50%", background: "var(--folha-500)", display: "grid", placeItems: "center", flexShrink: 0 }}>
              <Check size={24} color="var(--white)" strokeWidth={3} />
            </div>
            <div>
              <div className="eyebrow" style={{ color: "var(--manga-300)" }}>
                Pedido confirmado
              </div>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 800, marginTop: 2, letterSpacing: "-0.025em" }}>
                Pode vir buscar, {order.customerName}!
              </div>
            </div>
          </div>

          <div style={{ marginTop: 28, display: "grid", gridTemplateColumns: "232px 1fr", gap: 28, alignItems: "center" }}>
            <div ref={qrRef} style={{ padding: 12, background: "var(--white)", borderRadius: 18, boxShadow: "0 8px 24px rgba(46, 28, 10, 0.25)", width: 208, height: 208 }}>
              <QRCodeCanvas value={order.qrPayload} size={184} aria-label={`QR code do pedido ${order.code}`} />
            </div>

            <div>
              <div style={{ fontSize: 11, fontWeight: 700, letterSpacing: "0.12em", textTransform: "uppercase", color: "var(--ink-300)" }}>
                Mostre o QR no balcão
              </div>
              <div style={{ fontSize: 14, color: "var(--ink-200)", marginTop: 10, lineHeight: 1.5 }}>
                O atendente de {restaurantName} lê o QR pra liberar seu pedido. Salve essa tela ou tire um print.
              </div>

              <div
                style={{
                  marginTop: 18,
                  padding: "12px 14px",
                  background: "rgba(255,255,255,0.06)",
                  border: "1px dashed rgba(255,255,255,0.18)",
                  borderRadius: "var(--r-sm)",
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                  gap: 12,
                }}
              >
                <div>
                  <div style={{ fontSize: 10, fontWeight: 700, color: "var(--ink-400)", letterSpacing: "0.12em", textTransform: "uppercase" }}>Ou diga o código</div>
                  <div style={{ fontFamily: "var(--font-mono)", fontSize: 26, fontWeight: 700, letterSpacing: "0.06em", color: "var(--tomate-300)", marginTop: 2, lineHeight: 1 }}>
                    {order.code}
                  </div>
                </div>
                <button
                  type="button"
                  onClick={copyCode}
                  style={{
                    background: "transparent",
                    border: "1px solid rgba(255,255,255,0.18)",
                    color: "var(--white)",
                    borderRadius: 10,
                    padding: "8px 10px",
                    cursor: "pointer",
                    display: "inline-flex",
                    alignItems: "center",
                    gap: 6,
                    fontSize: 12,
                    fontWeight: 600,
                  }}
                >
                  <Copy size={13} /> {copied ? "Copiado!" : "Copiar"}
                </button>
              </div>

              <div style={{ display: "flex", gap: 8, marginTop: 14, flexWrap: "wrap" }}>
                <button type="button" className="btn" style={{ background: "var(--tomate-500)", color: "var(--white)", padding: "11px 16px", fontSize: 13 }} onClick={downloadQr}>
                  <Download size={13} /> Baixar QR
                </button>
                <a
                  className="btn btn-ghost"
                  style={{ color: "var(--white)", padding: "11px 14px", fontSize: 13, border: "1px solid rgba(255,255,255,0.18)" }}
                  href={`https://wa.me/?text=${whatsappText}`}
                  target="_blank"
                  rel="noreferrer"
                >
                  <Share2 size={13} /> WhatsApp
                </a>
              </div>
            </div>
          </div>

          <div style={{ marginTop: "auto", paddingTop: 36, display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
            <div>
              <div style={{ fontSize: 11, fontWeight: 700, color: "var(--ink-400)", letterSpacing: "0.12em", textTransform: "uppercase" }}>Pronto em</div>
              <div style={{ fontFamily: "var(--font-mono)", fontSize: 26, fontWeight: 700, color: "var(--folha-300)", marginTop: 4 }}>~{prepMinutes} min</div>
            </div>
          </div>
        </div>

        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="card" style={{ overflow: "hidden", flex: 1, display: "flex", flexDirection: "column" }}>
            <div style={{ padding: "18px 20px", flex: 1, display: "flex", flexDirection: "column", gap: 12 }}>
              <div style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 800, color: "var(--ink-800)", letterSpacing: "-0.02em" }}>{restaurantName}</div>
              <div style={{ display: "flex", gap: 10, alignItems: "flex-start" }}>
                <div style={{ color: "var(--tomate-500)", marginTop: 2 }}>
                  <MapPin size={16} />
                </div>
                <div style={{ fontSize: 14, color: "var(--ink-800)", lineHeight: 1.45 }}>
                  {order.restaurant.addressLine} — {order.restaurant.neighborhood}
                  <br />
                  <span style={{ color: "var(--fg-2)", fontSize: 13 }}>{order.restaurant.city}</span>
                </div>
              </div>
              <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
                <div style={{ color: "var(--tomate-500)" }}>
                  <Phone size={16} />
                </div>
                <span className="price" style={{ fontSize: 14, color: "var(--ink-800)" }}>
                  {order.restaurant.phone}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div style={{ marginTop: 24, display: "grid", gridTemplateColumns: "1.2fr 1fr", gap: 32, alignItems: "flex-start" }}>
        <div className="card" style={{ padding: 24 }}>
          <h3 style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 700, color: "var(--ink-800)", letterSpacing: "-0.02em" }}>O que você pediu</h3>
          <ul style={{ listStyle: "none", padding: 0, margin: "18px 0 0", display: "flex", flexDirection: "column", gap: 14 }}>
            {order.items.map((it) => (
              <li key={it.id} style={{ display: "flex", alignItems: "flex-start", gap: 12 }}>
                <span style={{ background: "var(--ink-100)", color: "var(--ink-700)", padding: "3px 9px", borderRadius: 6, fontSize: 12, fontFamily: "var(--font-mono)", fontWeight: 700, minWidth: 28, textAlign: "center" }}>
                  {it.qty}×
                </span>
                <div style={{ flex: 1 }}>
                  <span style={{ fontSize: 14, color: "var(--ink-800)", fontWeight: 500 }}>{it.nameSnapshot}</span>
                  {it.modifiers.length > 0 && (
                    <div style={{ fontSize: 12, color: "var(--fg-2)", marginTop: 2 }}>{it.modifiers.map((m) => m.option).join(", ")}</div>
                  )}
                  {it.note && <div style={{ fontSize: 12, color: "var(--ink-600)", marginTop: 2, fontStyle: "italic" }}>{it.note}</div>}
                </div>
                <span className="price" style={{ fontSize: 14, color: "var(--ink-700)" }}>
                  {formatCents(it.lineTotalCents)}
                </span>
              </li>
            ))}
          </ul>
          <hr className="divider" />
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            <Row label="Subtotal" value={formatCents(order.subtotalCents)} />
            {order.couponCode && <Row label={`Cupom ${order.couponCode}`} value={`− ${formatCents(order.discountCents)}`} valueColor="var(--tomate-600)" />}
            <Row label="Taxa de retirada" value="Grátis" valueColor="var(--folha-600)" />
          </div>
          <hr className="divider" />
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline" }}>
            <span style={{ fontFamily: "var(--font-display)", fontSize: 17, fontWeight: 700, color: "var(--ink-800)" }}>Total a pagar no balcão</span>
            <span className="price" style={{ fontSize: 24, fontWeight: 700, color: "var(--ink-800)" }}>
              {formatCents(order.totalCents)}
            </span>
          </div>
        </div>

        <aside style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div className="card" style={{ padding: 20 }}>
            <h4 style={{ fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 700, color: "var(--ink-800)", marginBottom: 14 }}>Como funciona a retirada</h4>
            <ol style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 14 }}>
              {[
                `Cai lá em ${restaurantName} no horário previsto.`,
                `Mostra o QR (ou diz o código ${order.code}) no balcão.`,
                "Paga direto com o restaurante (Pix, cartão ou dinheiro).",
                "Pega o rango e tchau!",
              ].map((step, i) => (
                <li key={i} style={{ display: "flex", gap: 12, fontSize: 13, color: "var(--ink-700)", lineHeight: 1.45 }}>
                  <span style={{ width: 24, height: 24, borderRadius: "50%", background: "var(--tomate-50)", color: "var(--tomate-600)", fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: 12, display: "grid", placeItems: "center", flexShrink: 0 }}>
                    {i + 1}
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </div>
          <Link href="/" className="btn btn-primary" style={{ padding: "14px 18px", fontSize: 14 }}>
            Fazer outro pedido
          </Link>
        </aside>
      </div>
    </div>
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
