# ADRs — Mandaí

**Architecture Decision Records**: o registro histórico das decisões arquiteturais do
projeto. Cada arquivo responde uma pergunta de "por quê" que o código sozinho não
responde.

Formato [Michael Nygard](https://cognitect.com/blog/2011/11/15/documenting-architecture-decisions):
quatro seções — Contexto, Decisão, Consequências, Alternativas consideradas.

---

## Índice

| Nº | Título | Status | Data |
|---|---|---|---|
| [0001](0001-monorepo-apps-sem-workspaces.md) | Monorepo com pastas `apps/*` sem workspaces | Accepted | 2026-09-06 |
| [0002](0002-fastify-ddd-manual-no-backend.md) | Fastify + DDD manual no backend | Accepted | 2026-09-06 |
| [0003](0003-nextjs-15-app-router-no-frontend.md) | Next.js 15 App Router no frontend | Accepted | 2026-09-06 |
| [0004](0004-prisma-neon-postgres.md) | Prisma + Neon Postgres | Accepted | 2026-09-06 |
| [0005](0005-ddd-clean-enxuto-um-bounded-context.md) | DDD/Clean enxuto com 1 bounded context | Accepted | 2026-09-06 |
| [0006](0006-sem-autenticacao-no-mvp.md) | Sem autenticação no MVP | Accepted | 2026-09-06 |
| [0007](0007-documentacao-em-docs.md) | Documentação em `docs/` (ERD, ADR, User Stories) | Accepted | 2026-09-06 |
| [0008](0008-slug-como-identificador-publico-do-restaurante.md) | `slug` como identificador público do restaurante | Accepted | 2026-09-06 |
| [0009](0009-rotas-do-frontend-em-pt-br.md) | Rotas do frontend em pt-BR | Accepted | 2026-09-06 |
| [0010](0010-superficie-da-api-v0-1-0.md) | Superfície da API v0.1.0 | Accepted | 2026-09-06 |
| [0011](0011-repositorio-em-memoria-como-segunda-implementacao-de-infra.md) | Repositório em memória como segunda implementação de infra | Accepted | 2026-09-06 |
| [0012](0012-piso-de-acessibilidade.md) | Piso de acessibilidade | Accepted | 2026-09-06 |
| [0013](0013-qr-sem-assinatura-criptografica-real.md) | QR sem assinatura criptográfica real | Accepted | 2026-09-06 |
| [0014](0014-order-status-enum-de-quatro-valores-so-placed-no-mvp.md) | `Order.status` — enum de quatro valores, só `PLACED` no MVP | Accepted | 2026-09-06 |
| [0015](0015-cupom-e-troca-de-restaurante-confirmados-no-mvp.md) | Cupom (US-07) e troca de restaurante (US-10) confirmados no MVP | Accepted | 2026-09-06 |
| [0016](0016-bug-conhecido-nextjs-notfound-devolve-200.md) | Bug conhecido do Next.js 15.5.25 — `notFound()` devolve HTTP 200 | Accepted | 2026-09-06 |

---

## Como funciona

**Um arquivo por decisão.** Nome no padrão `NNNN-slug-em-kebab-case.md`, com numeração
de 4 dígitos sequencial.

**ADRs são imutáveis.** Um ADR aceito não é reescrito. Correção de digitação e link
quebrado, sim; mudança de conteúdo, não.

**Decisão que muda vira ADR novo.** Crie o próximo número, escreva a nova decisão, e
marque o anterior como `Status: Superseded by ADR-NNNN` com link para o substituto. O
ADR antigo permanece no repositório — ele registra por que se pensou daquele jeito na
época.

**Numeração nunca é reaproveitada.** Um número, uma decisão, para sempre.

**O índice acima é atualizado no mesmo PR** que cria ou supera um ADR.

### Status possíveis

| Status | Quando usar |
|---|---|
| `Accepted` | A decisão está em vigor. É o padrão. |
| `Superseded by ADR-NNNN` | Outra decisão tomou o lugar desta. |
| `Deprecated` | A decisão não vale mais e nada a substituiu (o assunto deixou de existir). |

### Vale um ADR?

Se alguém poderia razoavelmente ter feito diferente, e mudar depois seria caro: vira
ADR. Escolha de nome de variável, não.

---

## Documentos irmãos

- [`../erd.md`](../erd.md) — modelo de dados em Mermaid. **Regra:** commit que altera
  `apps/api/prisma/schema.prisma` altera o ERD no mesmo commit.
- [`../user-stories/`](../user-stories/README.md) — US-01 a US-10, um arquivo por
  história, derivadas das telas do handoff.
- [`../../ARQUITETURA.md`](../../ARQUITETURA.md) — o plano inicial. É o ponto de
  partida histórico; quando divergir de um ADR, **o ADR mais recente vence**.

---

## Template

Copie o bloco abaixo para o novo arquivo.

````markdown
# ADR-NNNN: <título curto>

- **Status:** Accepted | Superseded by ADR-XXXX | Deprecated
- **Data:** YYYY-MM-DD

## Contexto
Qual problema ou força levou a esta decisão? Descreva a situação, as restrições e as
pressões em jogo — sem já defender a solução.

## Decisão
O que foi decidido, em frases curtas e diretas. "Decidimos X porque Y."

## Consequências
O que isso facilita, dificulta, ou compromete a manter. Seja honesto sobre o custo,
não só sobre o benefício.

## Alternativas consideradas
Outras opções e o motivo concreto de cada uma ter sido descartada.
````
