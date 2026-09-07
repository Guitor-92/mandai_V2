// Categorias são constante do frontend, não dado — `docs/erd.md` já fechou essa
// pendência (emoji e cor de fundo dos 8 tiles são design, não schema).

export type Category = {
  slug: string;
  label: string;
  emoji: string;
  bg: string;
};

export const CATEGORIES: Category[] = [
  { slug: "pizza", label: "Pizza", emoji: "🍕", bg: "var(--tomate-50)" },
  { slug: "japa", label: "Japonesa", emoji: "🍱", bg: "var(--folha-50)" },
  { slug: "burger", label: "Hambúrguer", emoji: "🍔", bg: "var(--manga-50)" },
  { slug: "acai", label: "Açaí", emoji: "🥭", bg: "var(--folha-50)" },
  { slug: "saudavel", label: "Saudável", emoji: "🥗", bg: "var(--folha-50)" },
  { slug: "doces", label: "Doces", emoji: "🍰", bg: "var(--manga-50)" },
  { slug: "bebidas", label: "Bebidas", emoji: "🥤", bg: "var(--manga-50)" },
  { slug: "brasileira", label: "Brasileira", emoji: "🌶️", bg: "var(--tomate-50)" },
];

export function categoryLabel(slug: string): string {
  return CATEGORIES.find((c) => c.slug === slug)?.label ?? slug;
}

// Bairro de retirada fixo no MVP — não há tela de troca desenhada (US-01, decisão
// registrada em docs/qa/pendentes-frontend.md).
export const DEFAULT_NEIGHBORHOOD = "Vila Madalena";
