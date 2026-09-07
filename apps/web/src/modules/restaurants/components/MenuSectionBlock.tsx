import Image from "next/image";
import { Flame, Plus } from "lucide-react";
import type { MenuItem, MenuSection } from "@/shared/types";
import { formatCents } from "@/shared/lib/money";

export function MenuSectionBlock({
  section,
  onItemClick,
  readOnly = false,
}: {
  section: MenuSection;
  onItemClick: (item: MenuItem) => void;
  readOnly?: boolean;
}) {
  return (
    <div id={section.id} style={{ marginBottom: 40, scrollMarginTop: 100 }}>
      <h2 style={{ fontFamily: "var(--font-display)", fontSize: 24, fontWeight: 700, color: "var(--ink-800)", letterSpacing: "-0.02em", marginBottom: 18 }}>
        {section.name}
      </h2>
      <div style={{ display: "grid", gridTemplateColumns: "1fr", gap: 14 }}>
        {section.items.map((item) => (
          <MenuItemRow key={item.id} item={item} onClick={() => onItemClick(item)} readOnly={readOnly} />
        ))}
      </div>
    </div>
  );
}

function MenuItemRow({ item, onClick, readOnly }: { item: MenuItem; onClick: () => void; readOnly: boolean }) {
  const isOut = item.availability === "OUT_OF_STOCK";
  const isLow = item.availability === "LOW_STOCK";
  const disabled = readOnly || isOut;

  return (
    <div
      role="button"
      tabIndex={disabled ? -1 : 0}
      onClick={disabled ? undefined : onClick}
      onKeyDown={(e) => {
        if (!disabled && (e.key === "Enter" || e.key === " ")) onClick();
      }}
      style={{
        background: "var(--bg-surface)",
        borderRadius: "var(--r-md)",
        padding: 16,
        boxShadow: "var(--shadow-1)",
        display: "flex",
        gap: 18,
        alignItems: "stretch",
        cursor: disabled ? "default" : "pointer",
        opacity: readOnly ? 0.6 : 1,
      }}
    >
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", gap: 8, alignItems: "center", marginBottom: 6, flexWrap: "wrap" }}>
          {item.isPopular && (
            <span style={{ background: "var(--manga-50)", color: "var(--manga-500)", padding: "2px 8px", borderRadius: 6, fontSize: 11, fontWeight: 700, display: "inline-flex", alignItems: "center", gap: 4 }}>
              <Flame size={11} /> Mais pedido
            </span>
          )}
          {item.promoLabel && (
            <span style={{ background: "var(--tomate-50)", color: "var(--tomate-600)", padding: "2px 8px", borderRadius: 6, fontSize: 11, fontWeight: 700 }}>
              {item.promoLabel}
            </span>
          )}
          {isLow && (
            <span style={{ background: "var(--manga-50)", color: "var(--manga-500)", padding: "2px 8px", borderRadius: 6, fontSize: 11, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase" }}>
              Últimas unidades
            </span>
          )}
          {isOut && (
            <span style={{ background: "var(--ink-100)", color: "var(--ink-600)", padding: "2px 8px", borderRadius: 6, fontSize: 11, fontWeight: 700, letterSpacing: "0.05em", textTransform: "uppercase" }}>
              Esgotado
            </span>
          )}
        </div>
        <div style={{ fontFamily: "var(--font-display)", fontSize: 17, fontWeight: 700, color: "var(--ink-800)", letterSpacing: "-0.01em" }}>{item.name}</div>
        <p style={{ fontSize: 14, color: "var(--fg-2)", lineHeight: 1.4, marginTop: 4, flex: 1 }}>{item.description}</p>
        <div className="price" style={{ fontSize: 17, color: "var(--ink-800)", marginTop: 10 }}>
          {formatCents(item.priceCents)}
        </div>
      </div>
      <div style={{ position: "relative", flexShrink: 0, opacity: isOut ? 0.5 : 1, filter: isOut ? "grayscale(1)" : undefined }}>
        <div style={{ width: 130, height: 130, borderRadius: "var(--r-md)", position: "relative", overflow: "hidden" }}>
          <Image src={item.imageUrl} alt="" fill sizes="130px" style={{ objectFit: "cover" }} />
        </div>
        {!readOnly && !isOut && (
          <button
            type="button"
            aria-label={`Adicionar ${item.name}`}
            onClick={(e) => {
              e.stopPropagation();
              onClick();
            }}
            style={{
              position: "absolute",
              bottom: -10,
              right: -10,
              width: 40,
              height: 40,
              borderRadius: "50%",
              background: "var(--tomate-500)",
              color: "var(--white)",
              border: "3px solid var(--white)",
              boxShadow: "var(--shadow-2)",
              cursor: "pointer",
              display: "grid",
              placeItems: "center",
            }}
          >
            <Plus size={18} color="var(--white)" strokeWidth={2.5} />
          </button>
        )}
      </div>
    </div>
  );
}
