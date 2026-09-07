import Link from "next/link";

export default function NotFound() {
  return (
    <section className="container" style={{ paddingTop: 96, paddingBottom: 96, textAlign: "center" }}>
      <h1 style={{ fontFamily: "var(--font-display)", fontSize: 40, fontWeight: 800, color: "var(--ink-800)", letterSpacing: "-0.03em" }}>
        Essa página fugiu do cardápio
      </h1>
      <p style={{ fontSize: 15, color: "var(--fg-2)", marginTop: 10 }}>
        Não achamos o que você tava procurando por aqui.
      </p>
      <Link href="/" className="btn btn-primary" style={{ marginTop: 24, display: "inline-flex", padding: "14px 24px", fontSize: 15 }}>
        Voltar pra Home
      </Link>
    </section>
  );
}
