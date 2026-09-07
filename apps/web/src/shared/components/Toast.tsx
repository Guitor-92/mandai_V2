"use client";

import { useCallback, useEffect, useState } from "react";

// Toast simples e local — usado pelos botões que "ainda não fazem nada de
// verdade" no MVP (DP-17 "Me avisa quando abrir/voltar", DP-22 "Indica um
// restaurante"): mostra a mensagem por alguns segundos e some sozinho.
export function useToast() {
  const [message, setMessage] = useState<string | null>(null);

  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => setMessage(null), 4000);
    return () => clearTimeout(timer);
  }, [message]);

  const showToast = useCallback((msg: string) => setMessage(msg), []);

  return { message, showToast };
}

export function ToastViewport({ message }: { message: string | null }) {
  if (!message) return null;
  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        position: "fixed",
        bottom: 28,
        left: "50%",
        transform: "translateX(-50%)",
        background: "var(--ink-800)",
        color: "var(--white)",
        padding: "14px 20px",
        borderRadius: "var(--r-md)",
        boxShadow: "var(--shadow-3)",
        fontSize: 14,
        maxWidth: 420,
        textAlign: "center",
        zIndex: 200,
      }}
    >
      {message}
    </div>
  );
}
