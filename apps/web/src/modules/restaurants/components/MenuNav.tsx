"use client";

import { useEffect, useState } from "react";

export function MenuNav({ sections }: { sections: { id: string; name: string }[] }) {
  const [activeId, setActiveId] = useState(sections[0]?.id);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries.filter((e) => e.isIntersecting).sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActiveId(visible[0].target.id);
      },
      { rootMargin: "-120px 0px -70% 0px", threshold: 0 },
    );
    for (const section of sections) {
      const el = document.getElementById(section.id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, [sections]);

  return (
    <aside>
      <div style={{ position: "sticky", top: 100 }}>
        <div style={{ fontSize: 12, fontWeight: 700, color: "var(--ink-500)", letterSpacing: "0.12em", textTransform: "uppercase", marginBottom: 14 }}>
          Cardápio
        </div>
        <ul style={{ listStyle: "none", padding: 0, margin: 0, display: "flex", flexDirection: "column", gap: 4 }}>
          {sections.map((s) => {
            const isActive = s.id === activeId;
            return (
              <li key={s.id}>
                <a
                  href={`#${s.id}`}
                  style={{
                    display: "block",
                    padding: "10px 14px",
                    color: isActive ? "var(--ink-800)" : "var(--ink-600)",
                    fontWeight: isActive ? 600 : 500,
                    fontSize: 14,
                    background: isActive ? "var(--tomate-50)" : "transparent",
                    borderLeft: isActive ? "3px solid var(--tomate-500)" : "3px solid transparent",
                    borderRadius: 6,
                    textDecoration: "none",
                  }}
                >
                  {s.name}
                </a>
              </li>
            );
          })}
        </ul>
      </div>
    </aside>
  );
}
