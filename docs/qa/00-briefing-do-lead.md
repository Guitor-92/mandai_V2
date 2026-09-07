# Briefing do lead — release 0.1.0

Data: 2026-09-06 · Time: `mandaí-development-team`

Este documento existe para que os quatro agentes possam trabalhar **em paralelo**
sem colidir nas decisões que ainda estavam abertas em `docs/erd.md`
("Pendências a resolver via ADR") e no `CLAUDE.md` ("Divergências conhecidas").

As decisões abaixo são **âncoras de coordenação**: valem imediatamente para quem
está escrevendo código. O `architect-agent` é quem as **ratifica e formaliza em
ADR** (ou as substitui, com justificativa registrada e aviso aos devs antes de
qualquer retrabalho).

---

## A. Identificador de restaurante: `slug`

`slug` é o identificador público, na URL e na API. `id` (cuid) continua sendo a PK
interna e as FKs do banco.

Motivo: o handoff usa `slug`, o SEO das páginas de restaurante é canal de aquisição
real (`ARQUITETURA.md` §3 e ADR-0003), e `padaria-do-ze` é legível na barra de
endereço. Fecha a pendência registrada no `docs/erd.md`.

## B. Rotas do frontend (pt-BR)

| Rota | Tela do handoff |
|---|---|
| `/` | `01 · Home` |
| `/categoria/[slug]` | `02 · Categoria` |
| `/busca?q=` | `11 · Busca — resultados` / `11b · sem resultados` |
| `/restaurante/[slug]` | `03 · Cardápio`, `07 · Fechado`, `08 · Item esgotado` |
| `/sacola` | `05 · Sacola`, `05b · Sacola vazia` |
| `/pedido/[codigo]` | `06 · Pedido confirmado` |

O modal `04 · Adicionar item` é overlay dentro de `/restaurante/[slug]`, não é rota.
`/pedido/[codigo]` vence `/confirmacao/[orderId]` do plano: o código `MA-XXXX` é o
artefato que a pessoa carrega até o balcão, então é ele que fica na URL.

## C. Contrato da API (v0.1.0)

Base local: `http://localhost:3001`. Todo dinheiro em **centavos inteiros**;
a API nunca devolve string formatada — formatação é do frontend.

| Método | Path | Serve |
|---|---|---|
| GET | `/api/health` | smoke test |
| GET | `/api/restaurants?category=&q=` | US-01, US-02 |
| GET | `/api/restaurants/:slug` | US-04, US-05, US-09 — devolve o restaurante **com** `openingHours`, `sections[].items[].modifierGroups[].options[]` |
| GET | `/api/search?q=` | US-03 — devolve `{ restaurants, items }` |
| POST | `/api/orders` | US-08 |
| GET | `/api/orders/:code` | US-08 (tela de confirmação lê por código) |
| POST | `/api/coupons/validate` | US-07 (opcional — implementar; é barato e `MANDA20` está desenhado) |

**Não** existe `GET /api/categories`: `docs/erd.md` já decidiu que as 8 categorias
da Home são constante do frontend (emoji e cor de fundo são design, não dado).

**Não** existe `GET /api/restaurants/:slug/items/:itemId`: o cardápio completo já
vem em `GET /api/restaurants/:slug`, e o modal abre a partir de dado que a página
já tem.

Erro segue o formato padrão do Fastify — `{ statusCode, error, message }` — que é o
que o `HttpError` do `ARQUITETURA.md` §2.2 produz naturalmente.

`POST /api/orders` **revalida no servidor** (nunca confie no cliente):
existência e disponibilidade de cada `MenuItem`, `minSelect`/`maxSelect` de cada
`ModifierGroup`, restaurante aberto, sacola mono-restaurante, e recalcula
subtotal/desconto/total a partir do banco.

## D. Sem banco de dados provisionado

Não há `DATABASE_URL` nesta máquina e não há projeto Neon criado. O ADR-0004
(Prisma + Neon Postgres) **continua valendo** como alvo de produção.

Para que a release seja verificável ponta a ponta hoje, a API precisa subir e
responder **sem banco**: uma segunda implementação dos repositórios, em memória,
usada quando `DATABASE_URL` está ausente. As duas implementações leem o **mesmo**
módulo de dados (`prisma/seed-data.ts`), então não há dado duplicado a manter.

Isso não é um remendo: é a demonstração mais limpa possível do conceito-âncora da
mentoria — "a interface mora no domínio, a implementação mora na infra", agora com
duas implementações trocáveis sem que o use case saiba. O `architect-agent`
registra em ADR.

## E. Convenções operacionais

- API na porta `3001`, web na `3000`. Web lê `NEXT_PUBLIC_API_BASE_URL`.
- Node 22 nesta máquina; `.nvmrc` do plano pede Node 20 LTS — ambos servem.
- Verificação mínima antes de qualquer agente declarar "pronto":
  `npx tsc --noEmit` limpo e `npm run build` verde na sua própria pasta.
- Seed espelha o handoff: 6-8 restaurantes e ~30 itens com os nomes, preços e
  imagens que aparecem em `design_handoff_mandai_web/src/screen-*.jsx`.

---

## Como perguntar

Dúvida que **bloqueia** o trabalho: registre em `docs/qa/pendentes-<seu-papel>.md`
com pergunta, opções consideradas e a **suposição sob a qual você seguiu**. Nunca
pare o trabalho esperando resposta — siga com a suposição documentada e siga em
frente. O lead roteia as perguntas para o PO e o Arquiteto, e o que voltar
diferente vira ajuste.
