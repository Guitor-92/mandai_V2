# Conformidade com a arquitetura — auditoria do `architect-agent`

Data: 2026-09-06 · **Reauditoria completa** — `apps/api` estruturalmente completo e
`apps/web` com as seis rotas do ADR-0009 no disco (`/`, `/categoria/[slug]`, `/busca`,
`/restaurante/[slug]`, `/sacola`, `/pedido/[codigo]`) mais `error.tsx`/`loading.tsx`/
`not-found.tsx` e ~20 componentes em `modules/`. `tsc`, `build` e `lint` limpos
segundo o frontend-agent; fluxo ponta a ponta verificado com pedido real (`MA-YPJ8`).
Os itens antes marcados N/A (por falta de UI) foram reconferidos nesta rodada.

---

## Backend — `apps/api`

| Item verificado | Esperado | Encontrado | Veredito |
|---|---|---|---|
| `domain/` importa Fastify ou Prisma | Zero imports | `grep -rn "fastify\|@prisma\|PrismaClient" apps/api/src/modules/ordering/domain/` → vazio | **OK** |
| Use cases são classes `execute(input)`, deps via construtor | Sim, sem Result pattern | Todos os 6 use cases (`create-order.ts`, `get-order.ts`, `get-restaurant.ts`, `list-restaurants.ts`, `search.ts`, `validate-coupon.ts`) seguem o padrão; erros via `throw new HttpError(...)`, nenhum `Result`/`Either` | **OK** |
| Map Prisma → Domínio | Função `toDomain()` no fim do arquivo do repo, sem classe `Mapper` | `apps/api/src/modules/ordering/infra/prisma-restaurant.repository.ts:113` (`toDomain`) e `:159` (`toMenuItemDomain`); mesmo padrão em `prisma-order.repository.ts` e `prisma-coupon.repository.ts` | **OK** |
| Wire-up em `ordering.module.ts`, explícito | Factory manual, sem decorators/container | `apps/api/src/modules/ordering/ordering.module.ts` — `buildOrderingModule(prisma)` instancia repos e use cases com `new`, decide Prisma vs. memória por `prisma !== null` | **OK** |
| Proibições do §8 (eventos de domínio, CQRS, 2º bounded context, workspaces, Zustand, lib de UI pesada) | Nenhuma deve aparecer | `grep -rniE "eventemitter\|domain.?event\|cqrs\|zustand\|reflect-metadata\|@injectable\|@module\|tsyringe\|awilix\|workspaces"` em `apps/api/src`, `apps/web/src` e nos dois `package.json` → vazio | **OK** |
| Repositório em memória como 2ª implementação (ADR-0011) | Interface idêntica à Prisma, mesma fonte de seed | `in-memory-restaurant.repository.ts`, `in-memory-order.repository.ts`, `in-memory-coupon.repository.ts` implementam as mesmas interfaces; todas importam `prisma/seed-data.ts` (`in-memory-restaurant.repository.ts:6`) | **OK** |
| Formato de erro `{ statusCode, error, message }` (ADR-0010) | Handler global no formato Fastify | `apps/api/src/app.ts` — `setErrorHandler` traduz `HttpError` e qualquer outro erro para exatamente essa forma | **OK** |
| Dinheiro em centavos inteiros na fronteira HTTP (ADR-0010) | Nunca float/string formatada | `Money` (`domain/value-objects/money.ts`) valida inteiro ≥ 0; `ordering.routes.ts` (`toRestaurantSummary`, `toMenuItem`, `toOrderDTO`) só expõe `priceCents`/`subtotalCents`/`discountCents`/`totalCents` como `number`; `.format()` do VO não é chamado em nenhum DTO | **OK** |
| `slug` como identificador público (ADR-0008) | Rotas por `:slug`, `id` confinado à infra | `ordering.routes.ts` usa `slugParamsSchema`/`codeParamsSchema`, nunca `:id`; `RestaurantRepository.findById` existe mas nenhuma rota o chama | **OK** |
| Superfície da API v0.1.0 (ADR-0010) | 7 endpoints, sem `/categories` nem `/items/:itemId` | `ordering.routes.ts` registra exatamente `GET /api/restaurants`, `GET /api/restaurants/:slug`, `GET /api/search`, `POST /api/orders`, `GET /api/orders/:code`, `POST /api/coupons/validate`; `+ GET /api/health` em `app.ts`. Nenhum dos dois endpoints descartados apareceu | **OK** |
| `POST /api/orders` revalida tudo no servidor | Disponibilidade, `minSelect`/`maxSelect`, restaurante aberto, mono-restaurante, recálculo de totais | `create-order.ts:44-141` — checa `isOpen`, existência do item, `OUT_OF_STOCK`, `minSelect`/`maxSelect` por grupo, opção indisponível, recalcula `subtotalCents`/`discountCents`/`totalCents` a partir do banco/seed. **Não** confia em nada de monetário vindo do cliente | **OK** |
| `Order.code` sem caracteres ambíguos | Alfabeto sem 0/O/1/I | `application/use-cases/order-code.ts:4` — `ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'` (sem 0, O, 1, I) | **OK** |
| `GET /api/orders/:code` devolve o suficiente para a tela de confirmação (P-01) | Ficha do restaurante (`name`, `logoUrl`, `addressLine`, `phone`) embutida na resposta, conforme `docs/qa/respostas-po.md` P-01 | **Corrigido, reconferido no disco.** `get-order.ts` agora recebe `RestaurantRepository` no construtor, busca por `findById(order.restaurantId)` e devolve `OrderWithRestaurant`; `ordering.module.ts:47` injeta os dois repos; `toOrderDTO(order, restaurant)` em `ordering.routes.ts:173` embute `restaurant` via `toRestaurantSnapshot` na resposta de `POST /orders` e `GET /orders/:code` | **OK** |
| `qrPayload` sem assinatura criptográfica real (ADR-0013, DP-16) | `https://mandai.app/pedido/{code}`, sem `?sig=` | **Corrigido, reconferido no disco.** `create-order.ts:157` monta `qrPayload` sem hash nem `?sig=` | **OK** |
| `qrPayload` aponta para uma rota que existe (ADR-0009) | `https://mandai.app/pedido/{code}` — a mesma rota que ADR-0009 fixou para a tela de confirmação | **Corrigido, reconferido no disco.** `create-order.ts:157` — `` `https://mandai.app/pedido/${code}` `` — bate com `/pedido/[codigo]` do ADR-0009 | **OK** |

### Corrigido: `GET /api/orders/:code` agora devolve a ficha do restaurante

Era uma lacuna funcional (`docs/qa/respostas-po.md` P-01 exige `Restaurant.name`,
`logoUrl`, `addressLine`, `phone` na resposta do pedido). Reconferido no disco: o
backend ajustou exatamente como sugerido — `GetOrderUseCase` recebe `RestaurantRepository`
pelo construtor, resolve por `findById(order.restaurantId)` e devolve
`{ order, restaurant }`; `CreateOrderUseCase` foi ajustado do mesmo jeito (também
devolve `{ order, restaurant }`, então `POST /api/orders` e `GET /api/orders/:code`
compõem o DTO da mesma função `toOrderDTO(order, restaurant)`). Fechado.

### Corrigido: `qrPayload` — sem `sig=` e apontando pra rota certa

Duas idas e voltas neste item, ambas fechadas e reconferidas por mim no disco:

1. O ADR-0013 (e DP-16) decidem que `qrPayload` não deveria carregar assinatura
   nenhuma, porque nenhuma rota a verifica — gerar uma sem verificador sugeria uma
   garantia inexistente. Eu tinha visto o `?sig=${signature}` na primeira leitura de
   `create-order.ts` mas não conectei com o ADR-0013 no relatório; o lead pegou isso.
   Corrigido: `create-order.ts:157` não gera mais hash nem `?sig=`.
2. A correção do item 1 trocou a URL por `https://mandai.app/r/${code}` — uma rota que
   não existe em lugar nenhum do App Router planejado (ADR-0009 fixa
   `/pedido/[codigo]`, não `/r/[codigo]`). Um QR pra rota inexistente é pior do que o
   `sig=` falso: o `sig=` era só um campo enganoso, um link 404 quebra o fluxo de
   retirada de verdade se o QR for lido fora do contexto da própria tela — por exemplo,
   a pessoa encaminha o link por WhatsApp em vez de mostrar a tela, conforme o botão
   "Compartilhar por WhatsApp" que `docs/qa/respostas-po.md` P-01 já prevê. Corrigido:
   `create-order.ts:157` agora é `` `https://mandai.app/pedido/${code}` ``.

Fechado nos dois pontos.

---

## Frontend — `apps/web`

| Item verificado | Esperado | Encontrado | Veredito |
|---|---|---|---|
| `app.css`/`tokens.css` são cópia do handoff | Byte-idênticos, hex ali é a fonte, não invenção | `diff design_handoff_mandai_web/styles/{app,tokens}.css apps/web/src/styles/{app,tokens}.css` → sem diferença | **OK** |
| Cor hardcoded fora de `tokens.css`/cópia do handoff | Sempre `var(--*)`, nunca hex inventado | Ver os dois itens abaixo (`constants.ts` e hex inline em `.tsx`) | **Desvio — precisa correção** |
| `--tomate-*` em heading | Nunca | 30 headings (`h1`/`h2`/`h3`) revisados em todo `apps/web/src` — todos usam `var(--ink-800)` (texto sobre fundo claro) ou `var(--white)` (`ClosedRestaurantView.tsx:53`, título sobre o hero escuro). Nenhum usa `--tomate-*` | **OK** |
| Sombra azulada vs. warm | Sombra sempre a partir de `rgba(46,28,10,…)` (tokens `--shadow-1..3`/`--shadow-pop`) ou overlay warm (`rgba(20-28,16-24,10-18,…)`) | A maioria dos overlays já é warm (`AddItemModal.tsx:98`, `ChangeRestaurantDialog.tsx:21`, `OutOfStockModal.tsx:24`, `ClosedRestaurantView.tsx:46/49` — todos `rgba(20-28,…)`). Duas exceções neutras (não azuis, mas também não warm): `OrderConfirmationView.tsx:71` (`boxShadow: "0 8px 24px rgba(0,0,0,0.25)"`) e `app/page.tsx:192` (`background: "rgba(0,0,0,0.18)"`) | **Desvio — precisa correção** (menor: não é azulada, mas quebra a convenção warm do design system) |
| Server Components por padrão, `'use client'` só no interativo | Listagens (`/`, `/categoria/[slug]`, `/busca`, `/restaurante/[slug]`, `/pedido/[codigo]`) sem `'use client'`; `/sacola` e componentes interativos com | Confirmado: as 5 páginas de listagem/leitura fazem `fetch` direto no Server Component, sem `'use client'`; `apps/web/src/app/sacola/page.tsx:1` tem `"use client"` (único `page.tsx` que precisa, por depender de `CartContext`/`localStorage` — conforme ADR-0009); os ~20 componentes client (`AddItemModal`, `CartView`, `MenuNav`, `SearchResultsView` etc.) são todos peças interativas (modal, sacola, scrollspy, filtros client-side de DP-06/DP-07), não páginas inteiras | **OK** |
| Sacola = Context + `useReducer` + sync `localStorage`, sem Zustand | Conforme ADR-0003 | `apps/web/src/modules/cart/context.tsx` — `CartProvider` com `useReducer`, `useEffect` de hidratação/persistência em `localStorage`, guarda contra `localStorage` indisponível; nenhuma dependência de Zustand no `package.json` | **OK** |
| Dinheiro em centavos inteiros no frontend | `unitPriceCents`, `lineTotalCents`, etc. como `number` inteiro | `apps/web/src/modules/cart/types.ts` — `unitPriceCents`, `priceDelta`, `lineTotalCents` todos `number`; formatação isolada em `apps/web/src/shared/lib/money.ts` | **OK** |
| Rotas pt-BR (ADR-0009) | `/`, `/categoria/[slug]`, `/busca`, `/restaurante/[slug]`, `/sacola`, `/pedido/[codigo]` | As seis existem em `apps/web/src/app/`, cada uma com o segmento dinâmico certo (`[slug]`, `[codigo]`) | **OK** |
| Sacola: cada adição cria linha nova (DP-11) | Nunca funde com linha existente | `context.tsx` — função `addItemToCart` não tem mais `sameLine`/merge; todo `ADD_ITEM` gera `lineId: crypto.randomUUID()` novo | **OK — corrigido** (era o achado fora do checklist da rodada anterior) |
| `page.module.css` órfão com `prefers-color-scheme: dark` (§11) | Removido — dark mode fora de escopo, arquivo não é importado | `apps/web/src/app/page.module.css` ainda existe no disco, ninguém o importa (`grep -rn "page.module.css" apps/web/src` → vazio), contém bloco `@media (prefers-color-scheme: dark)` (linhas ~130-140) | **Desvio — correção em andamento** (lead já pediu remoção) |

### Desvio a corrigir: hex fora de `tokens.css` — dois pontos distintos

**1. `constants.ts:15,18` — ainda aberto**, mesmo depois de uma rodada de correção
pedida pelo lead: `CATEGORIES` (8 categorias, `docs/erd.md`/ADR-0010) usa
`var(--tomate-50)`/`var(--folha-50)`/`var(--manga-50)` em seis linhas, mas `acai`
(`bg: "#F6E9F2"`) e `bebidas` (`bg: "#E0EEF0"`) continuam hex literal. Como já registrado
na rodada anterior, isto reflete um limite real de `tokens.css` (só 3 famílias de tom
claro pra 8 categorias, `--coco-*` não tem um tom claro) — a correção sugerida continua
de pé: ciclar os 3 tons existentes ou derivar um 4º com `color-mix(in srgb,
var(--coco-500) 12%, var(--white))` em vez de hex novo.

**2. ~27 ocorrências de `#fff` inline em `style={{}}`, espalhadas por 8 componentes** —
achado novo desta rodada, meu grep anterior (`#[0-9a-fA-F]{6}`) não pegava hex de 3
dígitos. Concentração: `OrderConfirmationView.tsx` (6, linhas 46/58/71/108/124/129),
`app/page.tsx` (7, linhas 25/49/65/112/147/182/231), `ClosedRestaurantView.tsx` (4,
linhas 20/36/51/53), `AddItemModal.tsx` (3, linhas 110/133/332), `MenuSectionBlock.tsx`
(3, linhas 103/104/111), `RestaurantHero.tsx` (2, linhas 22/34), `CartView.tsx:113`,
`Toast.tsx:34`.

Diferente do caso de `constants.ts`, aqui **não há limite de design system** — `white`
já é um token (`--white: #FFFFFF`, `tokens.css:64`). `color: "#fff"` deveria ser
`color: "var(--white)"` em todos os casos; é substituição direta, sem decisão de design
nenhuma envolvida, só o token que já existe não foi usado.

---

## Bug de dependência (não é desvio de código do time) — ver ADR-0016

O `frontend-agent` isolou um defeito do Next.js `^15.5.25`: `notFound()` renderiza o
conteúdo certo, mas devolve HTTP 200 em vez de 404 sob `next start`. Reproduzido com
rota mínima sem `fetch` — não é erro de uso. Registrei em **ADR-0016** como risco aceito
para a release 0.1.0 (não fazer bump de dependência sob pressão de prazo; conteúdo
visual está correto, o que a verificação e2e do §10 observa; ação de acompanhamento —
testar patch do Next isolado, fora da janela desta release — fica anotada lá). Afeta
`not-found.tsx` em `/`, `/restaurante/[slug]` e `/pedido/[codigo]`.

---

## Resumo para o lead

- **Backend: todos os itens auditados fechados** (9 no total, contando as 3 rodadas de
  correção do `qrPayload`/ficha do restaurante, todas reconfirmadas por mim no disco).
- **Frontend: reauditoria completa concluída.** OK confirmado em: cópia fiel de
  `tokens.css`/`app.css`, ausência de `--tomate-*` em heading (30 headings revisados),
  Server Components por padrão com `'use client'` só onde precisa (`/sacola` e ~20
  componentes interativos), sacola via Context+`useReducer` sem Zustand, centavos
  inteiros, as 6 rotas do ADR-0009, e a correção do DP-11 (sacola não funde mais
  linhas).
- **3 desvios abertos no frontend**, nenhum bloqueante para a demonstração, todos
  citados com `arquivo:linha` acima:
  1. `constants.ts:15,18` — hex ainda não corrigido de uma rodada anterior.
  2. ~27 ocorrências de `#fff` inline deveriam ser `var(--white)` (token já existe,
     não é limite de design system como o item 1 — é só reuso que não aconteceu).
  3. Duas sombras/overlays neutros (`rgba(0,0,0,…)`) em vez de warm —
     `OrderConfirmationView.tsx:71` e `app/page.tsx:192`.
  4. `page.module.css` órfão com bloco de dark mode, ainda no disco.
- **1 bug de dependência (Next.js) aceito como risco conhecido**, ADR-0016 — não
  bloqueante, não é desvio do time.
- Nenhuma proibição do `ARQUITETURA.md` §8 apareceu em `apps/api` ou `apps/web`.

### Nota de correção deste relatório

Minha primeira versão deste arquivo (e a leitura que embasou o ADR-0013) tratou a
ausência de assinatura no `qrPayload` como puramente documental — não percebi, ao ler
`create-order.ts` pela primeira vez, que o código já emitia um `?sig=` com hash real. O
lead pegou isso relendo o arquivo. O ADR-0013 em si continua correto como registro da
*decisão* (não deveria haver `sig=`); o que faltou foi eu marcar o código então
existente como desviante dela. Os itens de `qrPayload` acima já refletem a correção
subsequente, reconferida por mim de forma independente no disco (não só no relato do
lead) antes de marcar como OK.
