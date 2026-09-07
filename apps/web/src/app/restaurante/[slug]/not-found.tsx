import Link from "next/link";

export default function RestaurantNotFound() {
  return (
    <section className="container" style={{ paddingTop: 96, paddingBottom: 96, textAlign: "center" }}>
      <h1 style={{ fontFamily: "var(--font-display)", fontSize: 36, fontWeight: 800, color: "var(--ink-800)", letterSpacing: "-0.03em" }}>
        Não achamos esse restaurante
      </h1>
      <p style={{ fontSize: 15, color: "var(--fg-2)", marginTop: 10 }}>
        Ele pode ter saído do Mandaí, ou o endereço tá errado.
      </p>
      <Link href="/" className="btn btn-primary" style={{ marginTop: 24, display: "inline-flex", padding: "14px 24px", fontSize: 15 }}>
        Voltar pra Home
      </Link>
    </section>
  );
}
