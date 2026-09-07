"use client";

import { useMemo, useRef, useState } from "react";
import Image from "next/image";
import { Flame, Minus, Plus, X } from "lucide-react";
import type { MenuItem } from "@/shared/types";
import type { CartItemModifier } from "@/modules/cart/types";
import { formatCents } from "@/shared/lib/money";
import { useFocusTrap } from "@/shared/lib/useFocusTrap";

const NOTE_LIMIT = 140;

export type AddItemModalInitial = {
  qty: number;
  selectedOptionIds: string[];
  note?: string;
};

export function AddItemModal({
  item,
  onClose,
  onConfirm,
  initial,
  confirmLabel = "Adicionar à sacola",
}: {
  item: MenuItem;
  onClose: () => void;
  onConfirm: (payload: { qty: number; modifiers: CartItemModifier[]; note?: string }) => void;
  initial?: AddItemModalInitial;
  confirmLabel?: string;
}) {
  const dialogRef = useRef<HTMLDivElement>(null);
  useFocusTrap(dialogRef, onClose);

  const [selected, setSelected] = useState<Record<string, string[]>>(() => {
    if (!initial) return {};
    const map: Record<string, string[]> = {};
    for (const group of item.modifierGroups) {
      const ids = group.options.filter((o) => initial.selectedOptionIds.includes(o.id)).map((o) => o.id);
      if (ids.length > 0) map[group.id] = ids;
    }
    return map;
  });
  const [qty, setQty] = useState(initial?.qty ?? 1);
  const [note, setNote] = useState(initial?.note ?? "");

  function toggleOption(groupId: string, optionId: string, maxSelect: number) {
    setSelected((prev) => {
      const current = prev[groupId] ?? [];
      if (maxSelect === 1) {
        return { ...prev, [groupId]: current.includes(optionId) ? [] : [optionId] };
      }
      if (current.includes(optionId)) {
        return { ...prev, [groupId]: current.filter((id) => id !== optionId) };
      }
      if (current.length >= maxSelect) return prev;
      return { ...prev, [groupId]: [...current, optionId] };
    });
  }

  const modifiers: CartItemModifier[] = useMemo(() => {
    const list: CartItemModifier[] = [];
    for (const group of item.modifierGroups) {
      const ids = selected[group.id] ?? [];
      for (const option of group.options) {
        if (ids.includes(option.id)) {
          list.push({
            groupId: group.id,
            groupName: group.name,
            optionId: option.id,
            optionName: option.name,
            priceDeltaCents: option.priceDeltaCents,
          });
        }
      }
    }
    return list;
  }, [selected, item.modifierGroups]);

  const unitTotalCents = item.priceCents + modifiers.reduce((sum, m) => sum + m.priceDeltaCents, 0);
  const totalCents = unitTotalCents * qty;

  const unresolvedRequiredGroup = item.modifierGroups.find((group) => {
    const count = (selected[group.id] ?? []).length;
    return count < group.minSelect || count > group.maxSelect;
  });
  const canSubmit = !unresolvedRequiredGroup;

  function handleConfirm() {
    if (!canSubmit) return;
    onConfirm({ qty, modifiers, note: note.trim() || undefined });
  }

  return (
    <div
      role="presentation"
      onClick={onClose}
      style={{ position: "fixed", inset: 0, background: "rgba(20, 16, 10, 0.45)", zIndex: 100, overflowY: "auto" }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="add-item-title"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 760,
          maxWidth: "calc(100vw - 48px)",
          margin: "100px auto",
          background: "var(--white)",
          borderRadius: "var(--r-xl)",
          boxShadow: "var(--shadow-pop)",
          overflow: "hidden",
          display: "flex",
          flexDirection: "column",
        }}
      >
        <div style={{ position: "relative" }}>
          <div style={{ height: 280, position: "relative" }}>
            <Image src={item.imageUrl} alt="" fill sizes="760px" style={{ objectFit: "cover" }} />
          </div>
          <button
            type="button"
            aria-label="Fechar"
            onClick={onClose}
            style={{
              position: "absolute",
              top: 16,
              right: 16,
              width: 40,
              height: 40,
              borderRadius: 999,
              background: "var(--white)",
              border: 0,
              cursor: "pointer",
              boxShadow: "var(--shadow-2)",
              display: "grid",
              placeItems: "center",
            }}
          >
            <X size={18} color="var(--ink-800)" />
          </button>
          {item.isPopular && (
            <span
              style={{
                position: "absolute",
                top: 16,
                left: 16,
                background: "var(--manga-400)",
                color: "var(--ink-900)",
                fontWeight: 700,
                fontSize: 12,
                padding: "6px 11px",
                borderRadius: 999,
                display: "inline-flex",
                alignItems: "center",
                gap: 5,
              }}
            >
              <Flame size={12} /> Mais pedido da casa
            </span>
          )}
        </div>

        <div style={{ padding: "28px 32px 0", overflowY: "auto" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 20 }}>
            <div>
              <h2
                id="add-item-title"
                style={{ fontFamily: "var(--font-display)", fontSize: 28, fontWeight: 800, color: "var(--ink-800)", letterSpacing: "-0.025em" }}
              >
                {item.name}
              </h2>
              <p style={{ fontSize: 15, color: "var(--fg-2)", marginTop: 8, lineHeight: 1.5, maxWidth: 520 }}>{item.description}</p>
            </div>
            <div className="price" style={{ fontSize: 24, color: "var(--ink-800)", whiteSpace: "nowrap" }}>
              {formatCents(item.priceCents)}
            </div>
          </div>

          {item.modifierGroups.map((group) => {
            const availableOptions = group.options.filter((o) => o.available);
            if (availableOptions.length === 0) return null;
            const isRequired = group.minSelect > 0;
            const currentIds = selected[group.id] ?? [];
            return (
              <div key={group.id}>
                <hr className="divider" />
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <div>
                    <div style={{ fontFamily: "var(--font-display)", fontSize: 17, fontWeight: 700, color: "var(--ink-800)" }}>{group.name}</div>
                    <div style={{ fontSize: 13, color: "var(--fg-2)", marginTop: 2 }}>{group.helperText}</div>
                  </div>
                  <span
                    style={{
                      background: isRequired ? "var(--ink-100)" : "var(--folha-50)",
                      color: isRequired ? "var(--ink-700)" : "var(--folha-700)",
                      padding: "4px 10px",
                      borderRadius: 999,
                      fontSize: 11,
                      fontWeight: 700,
                      letterSpacing: "0.05em",
                      textTransform: "uppercase",
                    }}
                  >
                    {isRequired ? "Obrigatório" : "Opcional"}
                  </span>
                </div>
                <div
                  style={{
                    display: group.maxSelect > 1 ? "grid" : "flex",
                    gridTemplateColumns: group.maxSelect > 1 ? "1fr 1fr" : undefined,
                    flexDirection: group.maxSelect > 1 ? undefined : "column",
                    gap: 8,
                    marginTop: 14,
                  }}
                >
                  {availableOptions.map((option) => {
                    const isSelected = currentIds.includes(option.id);
                    const isSingle = group.maxSelect === 1;
                    return (
                      <label
                        key={option.id}
                        style={{
                          display: "flex",
                          alignItems: "center",
                          gap: 12,
                          padding: "12px 14px",
                          border: isSelected ? "1.5px solid var(--tomate-500)" : "1px solid var(--border-2)",
                          background: isSelected ? "var(--tomate-50)" : "var(--bg-surface)",
                          borderRadius: "var(--r-sm)",
                          cursor: "pointer",
                        }}
                      >
                        <input
                          type={isSingle ? "radio" : "checkbox"}
                          name={group.id}
                          checked={isSelected}
                          onChange={() => toggleOption(group.id, option.id, group.maxSelect)}
                          style={{ width: 18, height: 18, accentColor: "var(--tomate-500)", flexShrink: 0 }}
                        />
                        <span style={{ flex: 1, fontSize: 14, fontWeight: isSelected ? 600 : 500, color: "var(--ink-800)" }}>{option.name}</span>
                        <span
                          className="price"
                          style={{ fontSize: 13, color: option.priceDeltaCents === 0 ? "var(--folha-600)" : "var(--fg-2)", fontWeight: 600 }}
                        >
                          {option.priceDeltaCents === 0 ? "Grátis" : `+ ${formatCents(option.priceDeltaCents)}`}
                        </span>
                      </label>
                    );
                  })}
                </div>
              </div>
            );
          })}

          <hr className="divider" />
          <div>
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <label htmlFor="item-note" style={{ fontFamily: "var(--font-display)", fontSize: 17, fontWeight: 700, color: "var(--ink-800)" }}>
                Algum recado pro restaurante?
              </label>
              <span style={{ fontSize: 12, color: note.length >= NOTE_LIMIT ? "var(--tomate-600)" : "var(--fg-3)" }}>
                {note.length}/{NOTE_LIMIT}
              </span>
            </div>
            <textarea
              id="item-note"
              placeholder="Algum recado pro restaurante? (opcional)"
              maxLength={NOTE_LIMIT}
              value={note}
              onChange={(e) => setNote(e.target.value)}
              style={{
                width: "100%",
                marginTop: 12,
                background: "var(--bg-surface)",
                border: "1px solid var(--border-2)",
                borderRadius: "var(--r-sm)",
                padding: "12px 14px",
                fontFamily: "var(--font-body)",
                fontSize: 14,
                color: "var(--ink-800)",
                resize: "none",
                minHeight: 64,
                outline: "none",
              }}
            />
          </div>
          <div style={{ height: 8 }} />
        </div>

        <div
          style={{
            padding: "20px 32px",
            marginTop: 8,
            borderTop: "1px solid var(--border-1)",
            background: "var(--bg-page)",
            display: "flex",
            alignItems: "center",
            gap: 16,
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 4,
              background: "var(--bg-surface)",
              borderRadius: 999,
              padding: 4,
              boxShadow: "var(--shadow-inner)",
              border: "1px solid var(--border-2)",
            }}
          >
            <button
              type="button"
              aria-label="Diminuir quantidade"
              onClick={() => setQty((q) => Math.max(1, q - 1))}
              disabled={qty <= 1}
              style={{ width: 38, height: 38, borderRadius: "50%", background: "transparent", border: 0, color: "var(--ink-700)", cursor: "pointer", display: "grid", placeItems: "center" }}
            >
              <Minus size={16} />
            </button>
            <span style={{ minWidth: 28, textAlign: "center", fontFamily: "var(--font-mono)", fontWeight: 700, fontSize: 16, color: "var(--ink-800)" }}>
              {qty}
            </span>
            <button
              type="button"
              aria-label="Aumentar quantidade"
              onClick={() => setQty((q) => Math.min(20, q + 1))}
              disabled={qty >= 20}
              style={{ width: 38, height: 38, borderRadius: "50%", background: "var(--tomate-500)", border: 0, color: "var(--white)", cursor: "pointer", display: "grid", placeItems: "center" }}
            >
              <Plus size={16} strokeWidth={2.5} />
            </button>
          </div>
          <button
            type="button"
            className="btn btn-primary"
            disabled={!canSubmit}
            onClick={handleConfirm}
            style={{ flex: 1, padding: "16px 24px", fontSize: 15, justifyContent: "space-between", opacity: canSubmit ? 1 : 0.5, cursor: canSubmit ? "pointer" : "not-allowed" }}
          >
            <span>{confirmLabel}</span>
            <span className="price" style={{ fontSize: 16 }}>
              {formatCents(totalCents)}
            </span>
          </button>
        </div>
      </div>
    </div>
  );
}
