# ADR-0003: Next.js 15 App Router no frontend

- **Status:** Accepted
- **Data:** 2026-09-06

## Contexto

O handoff entrega 13 telas desktop em alta fidelidade, escritas como protótipos React
18 com Babel inline. O frontend precisa recriá-las com fidelidade de pixel, consumindo
a API do `apps/api`.

Três forças pesam na escolha:

1. **O conteúdo é majoritariamente leitura.** Home, categoria, cardápio e busca são
   listagens vindas do servidor. Só a sacola e o modal de adicionar item são
   genuinamente interativos. O handoff é explícito ao dizer que espera SSR/SSG para
   SEO das páginas de restaurante.
2. **O deploy é Vercel** (ADR-0001). O framework que a Vercel builda sem nenhuma
   configuração é o dela.
3. **As imagens são pesadas.** Capas de 1600px e fotos de prato de 1200px vindas do
   Unsplash. Servir isso sem otimização derruba qualquer métrica de carregamento, e
   escrever otimização de imagem à mão não é conteúdo de mentoria.

Há ainda a força didática: "Server Component vs Client Component" está listado como
conceito-âncora da mentoria. O framework precisa tornar essa fronteira visível.

## Decisão

O frontend é **Next.js 15 com App Router e TypeScript**, em `apps/web`.

**Server Components são o padrão.** As páginas de listagem (`page.tsx` da Home,
categoria, restaurante e busca) chamam `fetch()` direto no servidor e renderizam.

**`'use client'` é a exceção**, reservado ao que precisa de estado ou evento do
navegador: a sacola, o modal de adicionar item e os controles de quantidade.

A organização é **feature-based**: `src/modules/{restaurants,cart,orders}/`, cada um
com `components/`, `hooks/`, `services/` e `types.ts`. O que é transversal fica em
`src/shared/`.

**TanStack Query só no client**, para mutations (criar pedido) e para dados que
dependem do estado da sacola. Não usamos TanStack Query para o que um Server Component
já resolve.

A **sacola** é `CartContext` — React Context + `useReducer` — com sincronização para
`localStorage`. Sem Zustand.

`next/image` com `remotePatterns` para `images.unsplash.com`. Ícones via
`lucide-react`, substituindo o `Icon` SVG inline do handoff. `tokens.css` e `app.css`
são copiados do handoff quase literalmente e importados em `app/globals.css`.

## Consequências

O caminho do handoff para o código fica curto: cada `screen-*.jsx` vira uma `page.tsx`
correspondente e o JSX é amplamente reaproveitável. As listagens não têm spinner nem
estado de loading no cliente — chegam renderizadas.

`next/image` resolve formato, tamanho e lazy loading sem código nosso, e o deploy na
Vercel é literalmente "aponte para `apps/web`".

Os custos:

- **A fronteira server/client é uma nova classe de erro.** Passar uma função como prop
  de um Server Component para um Client Component, ou importar `useState` num arquivo
  sem `'use client'`, produz erros que não existem em SPA. Isso é conteúdo de aula,
  mas também é atrito real para quem está aprendendo.
- **O Context da sacola força um limite de `'use client'` alto na árvore.** Como o
  `CartProvider` fica em `providers.tsx` dentro do `layout.tsx`, é preciso cuidado para
  não arrastar as listagens inteiras para o cliente sem perceber.
- **Duas bibliotecas de estado assíncrono convivendo.** `fetch` em Server Component e
  TanStack Query no cliente resolvem problemas parecidos de formas diferentes. A regra
  "server para leitura de página, Query para mutation e estado do cliente" precisa ser
  dita em voz alta, ou o código vira uma mistura sem critério.
- **Acoplamento à Vercel.** O App Router roda em outros lugares, mas a otimização de
  imagem e o modelo de cache são melhores na Vercel. Sair dali tem custo.
- **Cache agressivo por padrão.** O `fetch` do Next tem semântica de cache própria; em
  desenvolvimento é comum ver dado velho e achar que o backend está errado.
- **Sem responsividade.** O handoff é desktop-only (1440px) e não vamos inventar
  breakpoints. Isso é escopo declarado, não esquecimento.

## Alternativas consideradas

**Next.js com Pages Router.** Mais simples de explicar, com `getServerSideProps`
sendo um conceito único e fácil. Descartado porque está em modo de manutenção: o
ecossistema, a documentação e as vagas de mercado já se moveram para o App Router.
Ensinar o padrão de saída seria um desserviço ao aluno.

**Vite + React SPA.** Setup mínimo, sem fronteira server/client, tempo de rebuild
instantâneo. Descartado por três motivos concretos: perde SSR para SEO das páginas de
restaurante (pedido explícito do handoff), perde `next/image` (teríamos que otimizar as
fotos do Unsplash na mão) e exige configurar roteamento, build e hospedagem
separadamente. Também perderíamos o conceito-âncora de Server Components.

**Remix / React Router v7.** Modelo de dados por rota (`loader`/`action`) muito
elegante e mais fácil de explicar que a fronteira RSC. Descartado por ser menos comum
no mercado brasileiro e por não ser nativo da Vercel — o deploy exigiria adaptador e
configuração extra, contrariando a lógica de "dois projetos, um clique" do ADR-0001.

**Astro.** Seria excelente para o lado de conteúdo e ótimo em performance. Descartado
porque metade do produto (sacola, modal, checkout) é interação, e o modelo de ilhas
adicionaria uma segunda fronteira de hidratação para explicar sem resolver nada que o
App Router não resolva.

**Zustand para a sacola.** Menos boilerplate que Context + reducer e sem o risco de
re-render em cascata. Descartado por ser mais uma dependência e mais um vocabulário
para um estado que tem exatamente quatro ações (adicionar, remover, mudar quantidade,
limpar). `useReducer` é API da própria linguagem do React — e mostrar que a plataforma
já resolve isso vale mais, aqui, do que a ergonomia.

**Tailwind.** Descartado porque o design system já chega pronto como CSS custom
properties em `tokens.css`. Reescrever aqueles tokens como configuração do Tailwind
seria trabalho puro de tradução, com risco de divergir do handoff.
