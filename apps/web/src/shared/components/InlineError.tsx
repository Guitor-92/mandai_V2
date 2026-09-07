"use client";

// DP-19: falha ao carregar uma listagem (restaurantes, cardápio, busca) usa um
// tratamento leve — sem código técnico, sem diagnóstico em três cartões. Isso
// é diferente da tela cheia de erro (US-09, tela 10), reservada só pra falha
// ao enviar o pedido (ver `modules/orders/components/OrderErrorScreen.tsx`).
export function InlineError({ onRetry }: { onRetry?: () => void }) {
  return (
    <div className="card" style={{ padding: "48px 32px", textAlign: "center" }}>
      <p style={{ fontSize: 15, color: "var(--ink-700)", fontWeight: 600 }}>Não rolou carregar agora.</p>
      {onRetry && (
        <button type="button" className="btn btn-primary" style={{ marginTop: 16, padding: "12px 20px", fontSize: 14 }} onClick={onRetry}>
          Tentar de novo
        </button>
      )}
    </div>
  );
}
