# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Estado atual do repositório

**Nada foi implementado ainda.** O repo contém apenas dois artefatos:

- `ARQUITETURA.md` — o plano completo (stack, estrutura de pastas, camadas, schema, deploy). É a especificação a seguir ao criar código.
- `design_handoff_mandai_web/` — o handoff de design, **read-only** (`ARQUITETURA.md` §1: "referência (não tocar)").

Não há `package.json`, `apps/`, `docs/`, nem git init. Não existem comandos de build/lint/test até que `apps/web` e `apps/api` sejam criados. O bootstrap está descrito passo a passo em `ARQUITETURA.md` §7.

Idioma: toda a documentação, copy de UI e nomes de rota são em **português brasileiro**. Código (identificadores, tipos) em inglês.

## O produto

Mandaí: pedidos de comida para **retirada no balcão** — sem entrega, sem login, pagamento presencial no restaurante. O fluxo é descoberta → cardápio → modal de customização → sacola → confirmação com código `MA-XXXX` + QR. Desktop-only (1440px); não há design responsivo nesta entrega.

## Arquitetura planejada (resumo operacional)

Monorepo sem workspaces: `apps/web` (Next.js 15 App Router) e `apps/api` (Fastify) são projetos npm **independentes** — cada um tem seu `package.json` e roda com `npm install && npm run dev` na própria pasta. Deploy = dois projetos Vercel apontando ao mesmo repo com Root Directory diferente.

O backend usa DDD/Clean **enxuto e explícito**, com um único bounded context (`modules/ordering`) e quatro camadas: `domain/` (entidades + VOs + interfaces de repositório, zero imports de Fastify/Prisma) → `application/use-cases/` (classes com `execute(input)`, deps via construtor) → `infra/` (repos Prisma, map `toDomain()` inline) → `http/` (plugin Fastify recebendo use cases já instanciados). O wire-up acontece em `ordering.module.ts` via factory manual — sem decorators, sem container de DI.

O frontend é feature-based (`src/modules/{restaurants,cart,orders}/` com `components/hooks/services/types`), Server Components por padrão nas listagens, `'use client'` só no interativo. Sacola = React Context + `useReducer` + sync com localStorage; TanStack Query só para mutations client-side.

## Restrições didáticas (o projeto é material de mentoria)

Este é um demo educacional para público com conhecimento básico em tech. `ARQUITETURA.md` §8 é explícito sobre o que **não** introduzir, mesmo que pareça melhor prática:

- Sem Result pattern — use cases lançam `HttpError` (404, 400) direto.
- Sem eventos de domínio, sem CQRS, sem múltiplos bounded contexts.
- Sem classes `Mapper` separadas — função `toDomain()` no fim do arquivo do repo.
- Sem workspaces/turborepo, sem Zustand, sem libs de UI pesadas.
- Sem auth, sem pagamento, sem responsividade, sem i18n/dark mode, sem E2E, sem observabilidade (§11).

Clareza > sofisticação. Se uma abstração precisa de explicação antes de ser entendida, ela não pertence a este repo.

## Design system — regras não negociáveis

Todos os valores vivem em `design_handoff_mandai_web/styles/tokens.css`. **Nunca invente cores, espaçamentos ou raios** — referencie as variáveis CSS. `tokens.css` e `app.css` são copiados quase literalmente para `apps/web/src/styles/`.

Semântica de cor que o handoff impõe:
- `--tomate-*` só em CTAs e destaques — **nunca em headings**.
- `--folha-*` só em estados positivos (aberto, grátis, confirmado).
- `--manga-*` só em promo/badge eventual, uso esparso.
- Sombras são **warm** (`rgba(46,28,10,…)`), nunca azuladas.

Tipografia: Bricolage Grotesque (display/headings), Plus Jakarta Sans (body), JetBrains Mono (preços, códigos, distâncias — sempre com `font-feature-settings: "tnum"` via `.price`).

Copy: coloquial paulistano sem gíria forçada ("Bora escolher um rango?", "Ih, deu ruim aqui."). Evitar emoji supérfluo e "saborosos"/"deliciar-se".

## Portando o handoff

Os `.jsx` em `design_handoff_mandai_web/src/` são **protótipos, não código de produção**: React 18 + Babel inline, sem imports/exports — cada arquivo declara funções globais e `shared.jsx` faz `Object.assign(window, {...})` no fim. Ao portar:

- Um `screen-*.jsx` → uma `page.tsx` do App Router. O JSX é amplamente reaproveitável; remova o wrapper `function ScreenX()` e o `<div className="screen">`.
- `Icon` (SVG inline em `shared.jsx`) → `lucide-react`.
- Imagens Unsplash montadas por `U(id, w)` → `next/image` com `remotePatterns`.
- `QrCodePattern` em `screen-confirm.jsx` é **decorativo** (padrão pseudo-aleatório com seed) — em produção use `qrcode.react` sobre o `qrPayload` do backend.
- `design-canvas.jsx` é o shell pan/zoom do canvas — **não portar**.
- Abrir `Mandai - Hi-fi Web.html` no navegador mostra as 13 telas; duplo clique numa artboard abre em foco (Esc sai).

## Divergências conhecidas entre os dois documentos

`ARQUITETURA.md` e `design_handoff_mandai_web/README.md` não concordam em tudo. Ao implementar, escolha conscientemente e registre um ADR:

- **Rotas**: o plano usa `/busca`, `/restaurante/[id]`, `/confirmacao/[orderId]`; o handoff usa `/buscar?q=`, `/restaurante/:slug`, `/finalizar`, `/pedido/:codigo`.
- **Endpoints**: o plano define 5 endpoints REST; o handoff espera também `/api/categories`, `/api/restaurants/:slug/items/:itemId` e `/api/coupons/validate`. Cupom é opcional no MVP (US-07).
- **Identificador de restaurante**: `id` no plano, `slug` no handoff (o schema tem ambos).

## Convenções de documentação

`docs/` na raiz guarda o "porquê": `docs/erd.md` (Mermaid `erDiagram`), `docs/user-stories.md` (US-01 a US-10), `docs/adr/NNNN-*.md`.

- **Regra de manutenção**: um commit que altera `prisma/schema.prisma` altera `docs/erd.md` no mesmo commit.
- ADRs são **imutáveis**: para mudar uma decisão, crie um novo ADR e marque o anterior `Status: Superseded by ADR-XXXX`. Template em `docs/adr/README.md`.

## Modelagem de dados — decisões já tomadas

`OrderItem` guarda `modifiersJson` como JSON (evita 3 tabelas) e faz **snapshot** de `nameSnapshot`/`priceCentsSnapshot`, para que o pedido sobreviva a mudanças no cardápio. Preços sempre em **centavos inteiros** (`priceCents`, `totalCents`); o VO `Money` valida ≥ 0 e formata BRL.

O `code` do pedido (`MA-XXXX`) é gerado no backend, alfanumérico maiúsculo, **sem caracteres ambíguos** (0/O, 1/I).

## Verificação end-to-end

Depois de implementar (`ARQUITETURA.md` §10): `apps/api` em `:3001` responde `curl localhost:3001/api/restaurants` com o seed; `apps/web` em `:3000` renderiza a Home com esses dados; o fluxo Home → restaurante → adicionar item → sacola → finalizar chega na confirmação com código `MA-XXXX`; `npm run build` limpo em cada app.
