# Mandaí API

API do Mandaí — Fastify + TypeScript, DDD/Clean enxuto (ver `ARQUITETURA.md` na raiz
do repo e `docs/erd.md`, `docs/adr/`).

## Rodando local

```bash
npm install
npm run dev
```

Sobe em `http://localhost:3001`. **Sem `DATABASE_URL` no ambiente, a API usa
repositórios em memória** com os dados de `prisma/seed-data.ts` — não precisa de
Postgres pra rodar a demo. Ver `docs/qa/00-briefing-do-lead.md`, seção D.

Com `DATABASE_URL` setada (Neon ou Postgres local):

```bash
npm run db:generate
npm run db:migrate
npm run db:seed
npm run dev
```

## Scripts

| Script | O que faz |
|---|---|
| `npm run dev` | `tsx watch src/server.ts` — servidor local com hot reload |
| `npm run build` | `tsc` — compila pra `dist/` |
| `npm start` | roda o build (`dist/src/server.js`) |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run db:generate` | `prisma generate` |
| `npm run db:migrate` | `prisma migrate dev` |
| `npm run db:seed` | popula o Postgres a partir de `prisma/seed-data.ts` |

## Arquitetura

Quatro camadas em `src/modules/ordering/` (DDD/Clean enxuto — ADR-0002, ADR-0005):

```
domain/          entidades + VOs + interfaces de repositório (zero Fastify/Prisma)
application/     use cases — execute(input), deps por construtor, lançam HttpError
infra/           2 implementações por repositório: prisma-*.repository.ts e
                 in-memory-*.repository.ts (ambas lêem prisma/seed-data.ts)
http/            ordering.routes.ts — plugin Fastify, validação com zod
ordering.module.ts   DI manual: escolhe Prisma ou in-memory conforme DATABASE_URL
```

## Endpoints

Base local: `http://localhost:3001`. Toda resposta de erro segue o formato
padrão do Fastify: `{ statusCode, error, message }`. Todo dinheiro é **centavos
inteiros** — a API nunca formata BRL, isso é responsabilidade do frontend.

### `GET /api/health`

Smoke test. Indica se a API está usando Postgres ou o fallback em memória.

```json
{ "status": "ok", "database": "in-memory" }
```

### `GET /api/restaurants?category=&q=&sort=`

Lista restaurantes (US-01, US-02). Todos os parâmetros são opcionais — sem
nenhum, devolve todos, ordenados por distância. `category` é uma das 8
categorias da Home (`pizza`, `japa`, `burger`, `acai`, `saudavel`, `doces`,
`bebidas`, `brasileira`) mais `padaria` (Padaria do Zé, fora dos 8 tiles da
Home, mas listada normalmente). `q` filtra por nome ou tags do restaurante.

`sort` é `"distance"` (padrão — DP-05, único critério da tela de categoria)
ou `"popular"` (`reviewCount` desc — DP-03, seção "Mais pedidos no bairro"
da Home, que lista restaurantes, não pratos).

Resposta: array de restaurante **resumido** (sem cardápio/horários — isso só
vem no detalhe).

```json
[
  {
    "id": "rest_padaria_ze",
    "slug": "padaria-do-ze",
    "name": "Padaria do Zé",
    "category": "padaria",
    "tags": "Padaria · Café · Brunch",
    "rating": 4.8,
    "reviewCount": 1247,
    "distanceMeters": 1200,
    "prepTimeMinutes": 18,
    "isOpen": true,
    "coverUrl": "https://images.unsplash.com/photo-...",
    "logoUrl": "https://images.unsplash.com/photo-...",
    "neighborhood": "Vila Madalena",
    "city": "São Paulo"
  }
]
```

### `GET /api/restaurants/:slug`

Detalhe completo (US-04, US-05, US-09): tudo do resumo + `addressLine`,
`phone`, `openingHours[]` e `sections[].items[].modifierGroups[].options[]`.
404 se o slug não existir.

```json
{
  "id": "rest_padaria_ze",
  "slug": "padaria-do-ze",
  "name": "Padaria do Zé",
  "...": "... campos do resumo ...",
  "addressLine": "R. Wisard, 348",
  "phone": "(11) 2389-0042",
  "openingHours": [
    { "dayOfWeek": 1, "opensAtMinutes": 420, "closesAtMinutes": 780 }
  ],
  "sections": [
    {
      "id": "sec_ze_mais_pedidos",
      "name": "Mais pedidos da casa",
      "position": 0,
      "items": [
        {
          "id": "item_ze_tapioca",
          "sectionId": "sec_ze_mais_pedidos",
          "name": "Tapioca de queijo coalho",
          "description": "Tapioca feita na hora...",
          "priceCents": 1890,
          "imageUrl": "https://images.unsplash.com/photo-...",
          "availability": "AVAILABLE",
          "isPopular": true,
          "promoLabel": null,
          "modifierGroups": [
            {
              "id": "mg_tapioca_acompanhamento",
              "name": "Escolha o acompanhamento",
              "helperText": "Escolha 1 opção",
              "minSelect": 1,
              "maxSelect": 1,
              "position": 0,
              "options": [
                { "id": "mo_tapioca_mel", "name": "Mel da casa", "priceDeltaCents": 0, "available": true, "position": 0 }
              ]
            }
          ]
        }
      ]
    }
  ]
}
```

`availability` é `"AVAILABLE" | "LOW_STOCK" | "OUT_OF_STOCK"`.

Seção sem nenhum `MenuItem` não aparece em `sections[]` (DP-08) — não é
enviada nem como seção vazia.

### `GET /api/search?q=`

US-03 — busca por nome/tags de restaurante e por nome/descrição de prato.
`q` é obrigatório (400 se vazio).

```json
{
  "restaurants": [ /* mesmo shape do resumo de /api/restaurants */ ],
  "items": [
    {
      "id": "item_ze_tapioca",
      "...": "... mesmo shape do item no detalhe do restaurante ...",
      "restaurantSlug": "padaria-do-ze",
      "restaurantName": "Padaria do Zé"
    }
  ]
}
```

### `POST /api/orders`

US-08 — cria o pedido. **Revalida tudo no servidor**, nunca confia no
payload: existência e disponibilidade de cada item, `minSelect`/`maxSelect`
de cada grupo de modificador, opções esgotadas, restaurante aberto, e
recalcula subtotal/desconto/total a partir dos dados do backend.

Request:

```json
{
  "restaurantSlug": "padaria-do-ze",
  "customerName": "Marina",
  "couponCode": "MANDA20",
  "items": [
    {
      "menuItemId": "item_ze_tapioca",
      "qty": 2,
      "selectedOptionIds": ["mo_tapioca_mel", "mo_tapioca_queijo_extra"],
      "note": "Bem quentinha"
    },
    { "menuItemId": "item_ze_misto", "qty": 1 }
  ]
}
```

- `couponCode` é opcional (US-07).
- `customerName`: obrigatório, mínimo 2 caracteres (após `trim()`), máximo 60
  (DP-24).
- `selectedOptionIds` é uma lista achatada de ids de `ModifierOption` — o
  grupo de cada opção é inferido a partir do cardápio do restaurante. Opção
  com `available: false` é sempre rejeitada, mesmo se enviada (DP-09).
- `note` é opcional, até 140 caracteres.

Resposta (`201`) — o pedido criado, igual ao shape de `GET /api/orders/:code`:

```json
{
  "id": "c72f891a-d065-4aeb-a6df-e4535d8005b8",
  "code": "MA-HCKE",
  "restaurantId": "rest_padaria_ze",
  "restaurant": {
    "slug": "padaria-do-ze",
    "name": "Padaria do Zé",
    "addressLine": "R. Wisard, 348",
    "neighborhood": "Vila Madalena",
    "city": "São Paulo",
    "phone": "(11) 2389-0042",
    "coverUrl": "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=1600&q=80&auto=format&fit=crop",
    "logoUrl": "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=300&q=80&auto=format&fit=crop"
  },
  "couponCode": "MANDA20",
  "customerName": "Marina",
  "status": "PLACED",
  "subtotalCents": 6070,
  "discountCents": 1214,
  "totalCents": 4856,
  "qrPayload": "https://mandai.app/pedido/MA-HCKE",
  "estimatedReadyAt": "2026-09-07T00:34:13.706Z",
  "createdAt": "2026-09-07T00:16:13.706Z",
  "items": [
    {
      "id": "6070f366-5ef9-448d-bf60-f0b3c336a538",
      "menuItemId": "item_ze_tapioca",
      "nameSnapshot": "Tapioca de queijo coalho",
      "priceCentsSnapshot": 1890,
      "qty": 2,
      "modifiers": [
        { "group": "Escolha o acompanhamento", "option": "Mel da casa", "priceDelta": 0 },
        { "group": "Adicionais", "option": "Queijo coalho extra", "priceDelta": 500 }
      ],
      "note": "Bem quentinha",
      "lineTotalCents": 4780
    }
  ]
}
```

`restaurant` é sempre o dado atual do restaurante (não é snapshot por
pedido) — só os `items[]` são congelados. `qrPayload` é uma URL
determinística sem assinatura real (DP-16, ADR-0013):
`https://mandai.app/pedido/{code}` — a mesma rota da tela de confirmação
(ADR-0009), pra quem ler o QR cair direto nela.

Erros comuns (`400`):

- Nome ausente/curto: `Escreve seu nome (pelo menos 2 letrinhas) pra gente te chamar no balcão.`
- Item esgotado: `"Pão na chapa com manteiga" está esgotado agora.`
- Grupo obrigatório sem escolha: `"Escolha o acompanhamento" em "Tapioca de queijo coalho" exige entre 1 e 1 escolha(s) — você enviou 0.`
- Restaurante fechado: `Empório Suco Bar está fechado agora. Não dá pra confirmar o pedido.`
- Cupom abaixo do mínimo: `Pedido mínimo de R$ 30,00 pra usar o cupom "MANDA20".`

### `GET /api/orders/:code`

US-08 — a tela de confirmação lê o pedido pelo código `MA-XXXX`. Mesmo shape
da resposta de `POST /api/orders`. 404 se o código não existir.

### `POST /api/coupons/validate`

US-07 (opcional) — validação isolada, útil pra sacola conferir o cupom antes
de finalizar. `POST /api/orders` revalida tudo de novo na criação do pedido.

Request:

```json
{ "code": "MANDA20", "subtotalCents": 6070 }
```

Resposta:

```json
{ "code": "MANDA20", "label": "20% off no pedido", "discountCents": 1214 }
```

Cupom de teste: `MANDA20` (20% off, pedido mínimo R$ 30,00, válido até
2026-12-31).

## Dados de demonstração

`prisma/seed-data.ts` é a fonte única — consumida tanto por `prisma/seed.ts`
(grava no Postgres) quanto pelos repositórios em memória. 9 restaurantes
(incluindo a Padaria do Zé, usada nas telas 03/04/05/06/08 do handoff),
cobrindo as 8 categorias da Home + padaria, com pelo menos um restaurante
fechado (`emporio-suco-bar`), um item `OUT_OF_STOCK`
(`item_ze_pao_chapa`) e um `LOW_STOCK` (`item_ze_bolo_fuba`).
