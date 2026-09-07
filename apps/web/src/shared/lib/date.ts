export function formatRelativeDate(iso: string): string {
  const then = new Date(iso).getTime();
  const days = Math.floor((Date.now() - then) / (1000 * 60 * 60 * 24));
  if (days <= 0) return "Pediu hoje";
  if (days === 1) return "Pediu ontem";
  if (days < 7) return `Pediu há ${days} dias`;
  if (days < 14) return "Pediu na semana passada";
  return `Pediu há ${Math.floor(days / 7)} semanas`;
}

export function formatReadyTime(iso: string): string {
  const date = new Date(iso);
  return date.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" });
}

export function formatEtaFromNow(iso: string): string {
  const diffMs = new Date(iso).getTime() - Date.now();
  const minutes = Math.max(1, Math.round(diffMs / 60_000));
  return `~${minutes} min`;
}
