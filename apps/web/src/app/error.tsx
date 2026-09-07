"use client";

import { useEffect } from "react";
import { InlineError } from "@/shared/components/InlineError";

// Boundary de erro do App Router — cobre falha inesperada de renderização/fetch
// nas páginas de listagem. DP-19: tratamento leve, não é a tela 10 (essa é
// exclusiva da falha ao enviar o pedido).
export default function RootError({ error, reset }: { error: Error & { digest?: string }; reset: () => void }) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <section className="container" style={{ paddingTop: 80, paddingBottom: 80 }}>
      <InlineError onRetry={reset} />
    </section>
  );
}
