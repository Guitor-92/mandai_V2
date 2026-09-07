import type { OpeningHour } from "@/shared/types";

// DP-18: OpeningHour é tabela — a grade semanal e a frase "abre amanhã às Xh"
// (tela 07) só saem de horários estruturados (minutos desde a meia-noite).

const DAY_NAME = ["Domingo", "Segunda", "Terça", "Quarta", "Quinta", "Sexta", "Sábado"];
const DAY_ABBR = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];
const DAY_ORDER = [1, 2, 3, 4, 5, 6, 0]; // segunda primeiro, pra exibição semanal

export function formatMinutes(total: number): string {
  const h = Math.floor(total / 60);
  const m = total % 60;
  return m === 0 ? `${h}h` : `${h}h${String(m).padStart(2, "0")}`;
}

export function weeklySchedule(hours: OpeningHour[]): { label: string; hoursLabel: string }[] {
  const byDay = new Map(hours.map((h) => [h.dayOfWeek, h]));
  const sequence = DAY_ORDER.map((day) => ({ day, oh: byDay.get(day) }));

  const groups: { days: number[]; oh?: OpeningHour }[] = [];
  for (const entry of sequence) {
    const last = groups[groups.length - 1];
    const sameAsLast =
      last &&
      ((!last.oh && !entry.oh) ||
        (!!last.oh &&
          !!entry.oh &&
          last.oh.opensAtMinutes === entry.oh.opensAtMinutes &&
          last.oh.closesAtMinutes === entry.oh.closesAtMinutes));
    if (sameAsLast) {
      last.days.push(entry.day);
    } else {
      groups.push({ days: [entry.day], oh: entry.oh });
    }
  }

  return groups.map((g) => ({
    label: g.days.length === 1 ? DAY_NAME[g.days[0]] : `${DAY_ABBR[g.days[0]]}–${DAY_ABBR[g.days[g.days.length - 1]]}`,
    hoursLabel: g.oh ? `${formatMinutes(g.oh.opensAtMinutes)} – ${formatMinutes(g.oh.closesAtMinutes)}` : "Fechado",
  }));
}

export function nextOpeningLabel(hours: OpeningHour[], now = new Date()): string {
  const byDay = new Map(hours.map((h) => [h.dayOfWeek, h]));
  const nowMinutes = now.getHours() * 60 + now.getMinutes();

  for (let offset = 0; offset <= 7; offset++) {
    const date = new Date(now);
    date.setDate(now.getDate() + offset);
    const oh = byDay.get(date.getDay());
    if (!oh) continue;
    if (offset === 0) {
      if (nowMinutes < oh.opensAtMinutes) return `abre hoje às ${formatMinutes(oh.opensAtMinutes)}`;
      continue; // já fechou hoje (ou o dado de isOpen diverge da hora) — procura o próximo dia
    }
    if (offset === 1) return `abre amanhã às ${formatMinutes(oh.opensAtMinutes)}`;
    return `abre ${DAY_NAME[date.getDay()].toLowerCase()} às ${formatMinutes(oh.opensAtMinutes)}`;
  }
  return "sem horário cadastrado essa semana";
}
