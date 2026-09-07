"use client";

// DP-07: buscas recentes guardadas no navegador (sem cadastro, sem servidor).
// Os últimos 5 termos, sem duplicata, mais recente primeiro.

const STORAGE_KEY = "mandai:recent-searches";
const MAX_ITEMS = 5;

export function getRecentSearches(): string[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed.filter((v): v is string => typeof v === "string") : [];
  } catch {
    return [];
  }
}

export function pushRecentSearch(term: string): void {
  const trimmed = term.trim();
  if (!trimmed) return;
  try {
    const current = getRecentSearches().filter((t) => t.toLowerCase() !== trimmed.toLowerCase());
    const next = [trimmed, ...current].slice(0, MAX_ITEMS);
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  } catch {
    // localStorage indisponível — busca recente só não persiste.
  }
}
