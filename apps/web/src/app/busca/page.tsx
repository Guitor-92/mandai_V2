import { search } from "@/modules/search/services/search.api";
import { SearchResultsView } from "@/modules/search/components/SearchResultsView";
import { SearchEmptyView } from "@/modules/search/components/SearchEmptyView";

export default async function SearchPage({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const { q } = await searchParams;
  const query = (q ?? "").trim();

  if (!query) {
    return (
      <section className="container" style={{ paddingTop: 56, paddingBottom: 56, textAlign: "center" }}>
        <p style={{ fontSize: 15, color: "var(--fg-2)" }}>Digite algo na busca lá em cima pra gente procurar.</p>
      </section>
    );
  }

  const result = await search(query);
  const isEmpty = result.restaurants.length === 0 && result.items.length === 0;

  if (isEmpty) return <SearchEmptyView query={query} />;

  return <SearchResultsView query={query} restaurants={result.restaurants} items={result.items} />;
}
