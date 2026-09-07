import { apiFetch, buildQuery } from "@/shared/lib/api";
import type { SearchResult } from "@/shared/types";

export function search(q: string): Promise<SearchResult> {
  return apiFetch<SearchResult>(`/api/search${buildQuery({ q })}`);
}
