# ADR-0009: Rotas do frontend em pt-BR

- **Status:** Accepted
- **Data:** 2026-09-06

## Contexto

`CLAUDE.md` documenta a divergência de frente: o plano (`ARQUITETURA.md` §3.1) desenha
`/busca`, `/restaurante/[id]`, `/confirmacao/[orderId]`; o handoff usa
`/buscar?q=`, `/restaurante/:slug`, `/finalizar`, `/pedido/:codigo`. Nenhum dos dois é
"o design" — o handoff é a referência visual (read-only), e o plano é um documento de
arquitetura escrito antes de qualquer um revisar as 13 telas com atenção a rota. É
necessário um mapa único, e ele precisa nascer de olhar o que cada tela realmente
precisa carregar, não de escolher um dos dois documentos por inteiro.

Três decisões pontuais dependiam de julgamento, não só de copiar um dos lados:

1. **Identificador do restaurante na URL** — já resolvido pelo ADR-0008: `slug`.
2. **Onde a busca vive** — o plano usa `/busca`, o handoff usa `/buscar?q=`. Nenhum dos
   dois nomes é "certo" objetivamente; é preciso escolher o registro de português mais
   natural e manter consistência com o restante do produto.
3. **Onde a confirmação vive** — divergência mais profunda que nome de rota: o plano
   usa `/confirmacao/[orderId]` (identificador interno do pedido), o handoff usa
   `/pedido/:codigo` (o código `MA-XXXX` que a pessoa vê na tela).
4. **Se o modal de adicionar item (tela 04) é rota própria** — nem o plano nem o handoff
   afirmam isso explicitamente; é preciso decidir a partir de como a tela 04 se
   comporta no protótipo.

O produto inteiro é em português brasileiro (`CLAUDE.md`, seção "Idioma") — não há
questão sobre isso, só sobre qual palavra e qual estrutura de segmento usar.

## Decisão

O mapa de rotas do App Router é:

| Rota | Tela do handoff | Server/Client |
|---|---|---|
| `/` | `01 · Home` | Server Component |
| `/categoria/[slug]` | `02 · Categoria` | Server Component |
| `/busca?q=` | `11 · Busca — resultados` / `11b · sem resultados` | Server Component |
| `/restaurante/[slug]` | `03 · Cardápio`, `07 · Fechado`, `08 · Item esgotado` | Server Component (com áreas client: modal, controles) |
| `/sacola` | `05 · Sacola`, `05b · Sacola vazia` | Client Component (lê `CartContext`) |
| `/pedido/[codigo]` | `06 · Pedido confirmado` | Server Component (busca por `GET /api/orders/:code`) |

Decisões específicas:

**Busca fica em `/busca?q=`, não `/buscar?q=`.** O plano vence aqui por uma razão de
consistência interna: todas as outras rotas do produto são substantivos
(`categoria`, `restaurante`, `sacola`, `pedido`), nunca verbos. `/buscar` quebraria esse
padrão sozinho. `busca` como substantivo também combina melhor com o padrão REST do
backend, que já usa `GET /api/search` (substantivo em inglês no código, conforme
convenção de identificadores) — manter o mesmo registro gramatical dos dois lados evita
uma inconsistência que não paga por nada.

**Confirmação fica em `/pedido/[codigo]`, não `/confirmacao/[orderId]`.** Isto é a
decisão de maior peso deste ADR, e o handoff vence por um motivo funcional, não
estético: o código `MA-XXXX` é o **artefato que a pessoa carrega até o balcão**. Ela
pode fechar a aba, perder o histórico do navegador, receber o link por WhatsApp de
outra pessoa que fez o pedido para ela, ou simplesmente digitar o código de cabeça no
celular do atendente. Em todos esses casos, o dado que sobrevive é o código — não o
`orderId` interno (cuid), que ninguém memoriza nem redigita. Uma URL construída em cima
do identificador que a pessoa efetivamente possui é mais robusta a exatamente os
cenários de uso reais dessa tela. `/pedido/[codigo]` também documenta, só pelo nome da
rota, que o backend busca por `code` (`GET /api/orders/:code`, ADR-0010) — o parâmetro
de rota e o parâmetro de API são a mesma string, sem tradução no meio.

**O modal `04 · Adicionar item` é overlay dentro de `/restaurante/[slug]`, não rota
própria.** No handoff, a tela 04 nunca aparece como navegação de página — ela abre por
cima do cardápio ao clicar num prato, mantém o cardápio visível ao fundo (o padrão
visual de overlay com scrim) e fecha devolvendo exatamente ao mesmo scroll do cardápio.
Se fosse rota (`/restaurante/[slug]/item/[itemId]`), voltar do modal exigiria navegação
de histórico, o scroll da página por trás se perderia, e a URL sugeriria uma página
compartilhável quando o dado necessário (o item) já veio inteiro na resposta de
`GET /api/restaurants/:slug` — não há razão para uma nova requisição de rota buscar de
novo o que a página pai já tem em mãos. O estado "modal aberto para o item X" vive em
estado de componente client (`useState` local a `/restaurante/[slug]`, ou querystring
não-navegável tipo `?item=` no máximo se for preciso linkar direto — mas nada disso é
rota do App Router).

**`/sacola` é Client Component.** É a única página de listagem que não pode ser Server
Component: o conteúdo vem inteiramente de `CartContext` (React Context sincronizado com
`localStorage`, ADR-0003), que só existe no navegador. Isso é a exceção prevista pelo
próprio ADR-0003 ("`'use client'` é a exceção, reservado ao que precisa de estado do
navegador") — a sacola é, por definição, esse caso.

## Consequências

O mapa fica com um único vocabulário: todo segmento de rota é substantivo em português,
todo identificador dinâmico é o dado que a pessoa realmente carrega (`slug` do
restaurante, `codigo` do pedido) em vez do identificador interno do banco. Isso é
consistente com a decisão do ADR-0008 de confinar `id`/cuid à camada de persistência.

`ARQUITETURA.md` §3.1, no que descreve `/busca`, `/confirmacao/[orderId]` fica
supersedido neste ponto por este ADR; `/categoria/[slug]` e a estrutura geral do plano
permanecem válidas e são, na prática, reafirmadas aqui.

Custos assumidos:

- **Divergir do nome do plano original em `/confirmacao` pode confundir quem leu só
  `ARQUITETURA.md` e não os ADRs.** É o próprio motivo de existir a regra "o ADR mais
  recente vence" (ADR-0007) — mas exige que quem onboarda leia os ADRs, não só o plano.
- **`GET /api/orders/:code` como forma de buscar o pedido da tela de confirmação
  significa que o código, além de ser mostrado, também é chave de busca ativa.** Reforça
  a exigência já registrada em `CLAUDE.md` e no ERD de que o código seja alfanumérico
  sem caracteres ambíguos (0/O, 1/I) — um erro de leitura no balcão não pode virar um
  código de *outro* pedido válido por acaso. Isso já era uma decisão tomada, mas este
  ADR aumenta a pressão sobre ela ao tornar `code` também parâmetro de rota pública.
- **Overlay em vez de rota para o modal 04 significa que ele não é um link
  compartilhável nem sobrevive a um refresh de página** (o item selecionado se perde).
  Isso é aceitável porque nenhuma tela do handoff trata o modal como destino de link, e
  o fluxo real (clicar no prato → customizar → adicionar à sacola) é sempre uma
  sequência dentro da mesma visita.

## Alternativas consideradas

**Adotar o plano por inteiro (`/busca`, `/confirmacao/[orderId]`).** Manteria
`ARQUITETURA.md` sem necessidade de ADR nesse ponto. Descartado porque `/confirmacao`
com `orderId` interno é estruturalmente pior para o caso de uso real da tela — a pessoa
não tem o `orderId` de cabeça, tem o código.

**Adotar o handoff por inteiro (`/buscar?q=`, `/finalizar`).** Mais fiel ao protótipo
literal. Descartado no ponto `/buscar` porque quebraria a consistência substantivo-only
das outras rotas sem ganho nenhum; `/finalizar` foi avaliado e não usado como nome de
rota porque, no mapa final, a etapa de "finalizar" é uma ação dentro de `/sacola`
(o botão que dispara `POST /api/orders`), não uma página intermediária separada — a
tela de handoff `/finalizar` corresponde, na prática, ao estado "sacola pronta para
confirmar", que já é `/sacola`.

**Rota própria para o modal de adicionar item
(`/restaurante/[slug]/item/[itemId]`).** Deixaria o item selecionado linkável e
sobrevivente a refresh. Descartado pelos motivos funcionais acima (perda de scroll,
navegação de histórico desnecessária, dado já disponível na página pai) — e porque
nenhuma US (US-04, US-05) pede link direto para um item específico.

**Identificador de pedido por `orderId` (cuid) na URL, com o código exibido só no corpo
da página.** Preservaria a mesma lógica do ADR-0008 (interno vs. público) aplicada a
pedidos. Descartado porque, diferente do restaurante, o pedido não tem um "nome bonito"
alternativo ao código — o código *é* o identificador público por natureza (é para isso
que ele existe, "o `MA-XXXX` que se apresenta no balcão", conforme `docs/erd.md`). Usar
`orderId` na URL seria reintroduzir o mesmo problema que o ADR-0008 resolveu para
restaurante, sem necessidade: aqui já existe um identificador público de fábrica.
