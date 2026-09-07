import type { ApiErrorBody } from "@/shared/types";

// Lido tanto em Server Components (fetch no servidor) quanto no client.
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:3001";

export class ApiError extends Error {
  statusCode: number;
  error: string;

  constructor(body: ApiErrorBody) {
    super(body.message);
    this.name = "ApiError";
    this.statusCode = body.statusCode;
    this.error = body.error;
  }
}

/**
 * Wrapper fino sobre `fetch`. `cache: "no-store"` por padrão — o cache do fetch do
 * Next.js é ótimo em produção, mas mostra dado velho durante o desenvolvimento e é
 * fonte comum de "o backend tá errado" que na verdade é cache (ADR-0003).
 */
export async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE_URL}${path}`, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
    },
    cache: init?.cache ?? "no-store",
  });

  if (!res.ok) {
    let body: ApiErrorBody;
    try {
      body = (await res.json()) as ApiErrorBody;
    } catch {
      body = { statusCode: res.status, error: res.statusText, message: "Erro inesperado ao falar com o servidor." };
    }
    throw new ApiError(body);
  }

  if (res.status === 204) return undefined as T;
  return (await res.json()) as T;
}

export function buildQuery(params: Record<string, string | undefined>): string {
  const search = new URLSearchParams();
  for (const [key, value] of Object.entries(params)) {
    if (value) search.set(key, value);
  }
  const qs = search.toString();
  return qs ? `?${qs}` : "";
}
