# Mandaí — Web

Frontend do Mandaí — Next.js 15 (App Router) + TypeScript. Ver `ARQUITETURA.md`
na raiz do repo, `docs/erd.md`, `docs/user-stories/`, `docs/adr/` e
`docs/decisoes-produto.md` para o contexto completo do produto.

## Rodando local

```bash
npm install
npm run dev
```

Sobe em `http://localhost:3000`. Precisa da API rodando em `http://localhost:3001`
(`apps/api`, `npm run dev` — funciona sem banco, com repositórios em memória).
Configure `NEXT_PUBLIC_API_BASE_URL` em `.env.local` se a API estiver em outro
endereço (default já aponta para `http://localhost:3001`, ver `.env.example`).

## Scripts

| Script | O que faz |
|---|---|
| `npm run dev` | Servidor de desenvolvimento (`next dev`) |
| `npm run build` | Build de produção |
| `npm run start` | Sobe o build de produção |
| `npm run lint` | ESLint (flat config via `eslint-config-next`) |

## Estrutura

```
src/
├── app/                       # App Router — uma pasta por rota
├── modules/
│   ├── restaurants/           # cardápio, cards, cardápio fechado/esgotado
│   ├── cart/                  # sacola: contexto, modal de item, mini-sacola
│   ├── orders/                # checkout, confirmação, cupom
│   └── search/                # busca por texto
├── shared/
│   ├── components/            # AppHeader, AppFooter, Toast, InlineError
│   └── lib/                   # api.ts, money.ts, opening-hours.ts, ...
└── styles/                    # tokens.css e app.css (copiados do handoff)
```

## Mapa rota → tela do handoff → user story

| Rota | Tela(s) do handoff | User story |
|---|---|---|
| `/` | `01 · Home` | US-01, US-02 (grade de categorias) |
| `/categoria/[slug]` | `02 · Categoria` | US-02 |
| `/busca?q=` | `11 · Busca — resultados` / `11b · sem resultados` | US-03 |
| `/restaurante/[slug]` | `03 · Cardápio`, `04 · Adicionar item` (via `?item=`), `07 · Fechado`, `08 · Item esgotado` | US-04, US-05, US-09 |
| `/sacola` | `05 · Sacola`, `05b · Sacola vazia`, `06 · Finalização` (formulário), `10 · Erro` (falha técnica) | US-06, US-07, US-08, US-09 |
| `/pedido/[codigo]` | `06 · Pedido confirmado` | US-08 |

O modal de adicionar item (`04`) é overlay controlado por `?item=<id>` dentro
de `/restaurante/[slug]` — não é rota própria (ADR-0009). O aviso de troca de
restaurante com sacola não vazia (US-10) não tem tela no handoff; a copy foi
escrita seguindo o tom do produto e está em
`src/modules/cart/components/ChangeRestaurantDialog.tsx` (ver DP-21 em
`docs/decisoes-produto.md`).

## User stories cobertas

US-01 a US-09 implementadas por completo. US-10 (opcional) implementada — o
aviso de troca de restaurante dispara ao tentar adicionar item de um
restaurante diferente com a sacola não vazia. Nada ficou de fora do escopo
combinado; decisões e suposições assumidas estão em
`docs/qa/pendentes-frontend.md`.

## Verificação

```bash
npx tsc --noEmit   # limpo
npm run build      # verde
npm run lint       # limpo
```

Fluxo ponta a ponta testado com a API local: Home lista os restaurantes do
seed → cardápio da Padaria do Zé renderiza as seções e o modal de
customização → sacola calcula subtotal/cupom/total → checkout gera um pedido
real (`POST /api/orders`) → `/pedido/MA-XXXX` mostra o QR e o código.
