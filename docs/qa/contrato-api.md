# Contrato da API — v0.1.0

Escrito pelo `backend-agent` pro `frontend-agent` integrar. Base local:
`http://localhost:3001`. Todo dinheiro em **centavos inteiros** — a API nunca
formata BRL, isso é responsabilidade do frontend. Erros seguem o formato
padrão do Fastify: `{ statusCode, error, message }`.

Documentação completa com todos os campos em `apps/api/README.md`. Este
arquivo traz o shape exato de cada resposta, com exemplos reais copiados da
verificação do backend (ver report do `backend-agent`).

## `GET /api/health`

```json
{ "status": "ok", "database": "in-memory" }
```

`database` é `"in-memory"` ou `"postgres"` — não deve importar pro frontend,
é só diagnóstico.

## `GET /api/restaurants?category=&q=&sort=`

Todos opcionais. `category` é uma das 8 categorias da Home (`pizza`, `japa`,
`burger`, `acai`, `saudavel`, `doces`, `bebidas`, `brasileira`) mais `padaria`
(a Padaria do Zé fica fora dos 8 tiles, mas aparece nas listagens gerais).

`sort` é `"distance"` (padrão, `distanceMeters` asc — DP-05, único critério
de ordenação da tela de categoria) ou `"popular"` (`reviewCount` desc — DP-03,
usado pela seção "Mais pedidos no bairro" da Home, que lista restaurantes,
não pratos). Exemplo: `GET /api/restaurants?sort=popular`.

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
    "coverUrl": "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=1600&q=80&auto=format&fit=crop",
    "logoUrl": "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=300&q=80&auto=format&fit=crop",
    "neighborhood": "Vila Madalena",
    "city": "São Paulo"
  }
]
```

Não tem `sections`/`openingHours`/`addressLine`/`phone` aqui — só no detalhe.

## `GET /api/restaurants/:slug`

404 com `{ statusCode: 404, error: "Not Found", message: "Restaurante \"x\" não encontrado." }`
se o slug não existir.

```json
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
  "coverUrl": "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=1600&q=80&auto=format&fit=crop",
  "logoUrl": "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=300&q=80&auto=format&fit=crop",
  "neighborhood": "Vila Madalena",
  "city": "São Paulo",
  "addressLine": "R. Wisard, 348",
  "phone": "(11) 2389-0042",
  "openingHours": [
    { "dayOfWeek": 1, "opensAtMinutes": 420, "closesAtMinutes": 780 },
    { "dayOfWeek": 6, "opensAtMinutes": 420, "closesAtMinutes": 840 }
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
          "description": "Tapioca feita na hora, recheada com queijo coalho derretido. Acompanha potinho de mel da casa pra você regar do jeito que gosta.",
          "priceCents": 1890,
          "imageUrl": "https://images.unsplash.com/photo-1639024471283-03518883512d?w=800&q=80&auto=format&fit=crop",
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
                { "id": "mo_tapioca_mel", "name": "Mel da casa", "priceDeltaCents": 0, "available": true, "position": 0 },
                { "id": "mo_tapioca_geleia", "name": "Geléia de pimenta artesanal", "priceDeltaCents": 300, "available": true, "position": 1 },
                { "id": "mo_tapioca_doce_leite", "name": "Doce de leite cremoso", "priceDeltaCents": 400, "available": true, "position": 2 }
              ]
            },
            {
              "id": "mg_tapioca_adicionais",
              "name": "Adicionais",
              "helperText": "Quantos quiser",
              "minSelect": 0,
              "maxSelect": 4,
              "position": 1,
              "options": [
                { "id": "mo_tapioca_queijo_extra", "name": "Queijo coalho extra", "priceDeltaCents": 500, "available": true, "position": 0 }
              ]
            }
          ]
        },
        {
          "id": "item_ze_pao_chapa",
          "name": "Pão na chapa com manteiga",
          "priceCents": 650,
          "availability": "OUT_OF_STOCK",
          "modifierGroups": []
        }
      ]
    }
  ]
}
```

`availability` é `"AVAILABLE" | "LOW_STOCK" | "OUT_OF_STOCK"` — tela 08 do
handoff trata os três estados de forma diferente (normal / "Últimas
unidades" / "Esgotado" com botão desabilitado).

Restaurante fechado (tela 07) é só `isOpen: false` — o frontend decide a UI;
`openingHours` dá a grade semanal pra montar "Seg–Sex 7h–13h".

Restaurante fechado de exemplo no seed: `emporio-suco-bar`.

**DP-08:** seção de cardápio sem nenhum `MenuItem` **não aparece** em
`sections[]` — nem vazia, nem como item desabilitado. A navegação lateral do
frontend deve ser montada a partir desta mesma lista já filtrada (não existe
uma lista separada de "todas as seções").

## `GET /api/search?q=`

`q` obrigatório — 400 se vazio: `{ message: "Informe um termo de busca." }`.

```json
{
  "restaurants": [ /* mesmo shape do resumo acima */ ],
  "items": [
    {
      "id": "item_ze_tapioca",
      "sectionId": "sec_ze_mais_pedidos",
      "name": "Tapioca de queijo coalho",
      "description": "...",
      "priceCents": 1890,
      "imageUrl": "...",
      "availability": "AVAILABLE",
      "isPopular": true,
      "promoLabel": null,
      "modifierGroups": [ /* ... */ ],
      "restaurantSlug": "padaria-do-ze",
      "restaurantName": "Padaria do Zé"
    }
  ]
}
```

Busca sem resultado nenhum → `{ "restaurants": [], "items": [] }` (200, não
404) — é o estado "11b · sem resultados" do handoff.

## `POST /api/orders`

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

- `couponCode`, `selectedOptionIds` e `note` são opcionais.
- `customerName`: obrigatório, mínimo 2 caracteres depois de `trim()`, máximo
  60 (DP-24). Abaixo do mínimo → 400 com a mensagem exata definida pelo PO:
  `Escreve seu nome (pelo menos 2 letrinhas) pra gente te chamar no balcão.`
- `selectedOptionIds` é uma lista **achatada** de ids de `ModifierOption` —
  não precisa agrupar por `ModifierGroup`, o servidor infere o grupo de cada
  opção a partir do cardápio. Uma opção com `available: false` é sempre
  rejeitada aqui (400), mesmo que o frontend não devesse tê-la oferecido
  (DP-09) — é a mesma lógica de "nunca confiar no cliente" do
  `minSelect`/`maxSelect`.
- `qty`: inteiro entre 1 e 20. Duas linhas com o mesmo `menuItemId` são
  aceitas sem dedupe (DP-11 — a sacola já trata cada adição como linha
  própria, o servidor só ecoa isso).

Resposta `201` (shape idêntico ao de `GET /api/orders/:code`) — exemplo real:

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
    },
    {
      "id": "c8ebd50f-0367-46dc-a608-cd1ec6e1e50d",
      "menuItemId": "item_ze_misto",
      "nameSnapshot": "Misto quente clássico",
      "priceCentsSnapshot": 1290,
      "qty": 1,
      "modifiers": [],
      "note": null,
      "lineTotalCents": 1290
    }
  ]
}
```

`restaurantId` continua no payload (é o cuid interno, útil pra debug/logs),
mas o frontend deve usar o objeto `restaurant` embutido — é ele que carrega
nome, logo, endereço e telefone que a tela `/pedido/[codigo]` precisa (P-01),
sem precisar de um segundo request. `restaurant` é sempre o dado **atual**
do restaurante (não é congelado por pedido) — só os itens (`items[]`) são
snapshot.

`code` é `MA-XXXX` — 4 caracteres em maiúsculo, sem `0 O 1 I`. `qrPayload` é
uma URL determinística **sem assinatura criptográfica** (DP-16, ADR-0013):
`https://mandai.app/pedido/{code}` — mesma rota da tela de confirmação
(ADR-0009), sem `sig=` nem nada parecido, pra que o atendente que ler o QR
caia direto em `/pedido/[codigo]`. Dá pra gerar o QR no frontend com
`qrcode.react` em cima desse valor direto (é o `qrPayload` que o handoff
pede, ver `CLAUDE.md` sobre `QrCodePattern`).

Erros de validação de negócio (`400`), mensagens prontas pra mostrar na UI
(US-09):

| Situação | Mensagem |
|---|---|
| Nome ausente/curto demais | `Escreve seu nome (pelo menos 2 letrinhas) pra gente te chamar no balcão.` |
| Sacola vazia | `A sacola está vazia.` |
| Item não existe no cardápio do restaurante | `Item "x" não encontrado no cardápio de <nome>.` |
| Item esgotado | `"Pão na chapa com manteiga" está esgotado agora.` |
| Grupo obrigatório sem escolha (ou fora do min/max) | `"Escolha o acompanhamento" em "Tapioca de queijo coalho" exige entre 1 e 1 escolha(s) — você enviou 0.` |
| Opção esgotada ou desabilitada (DP-09) | `A opção "x" de "y" está esgotada.` |
| Restaurante fechado | `Empório Suco Bar está fechado agora. Não dá pra confirmar o pedido.` (ver `docs/qa/respostas-po.md` P-02 pra copy de UI recomendada) |
| Cupom não existe | `Cupom "X" não existe.` (404) |
| Cupom inativo/expirado | `Cupom "X" não está mais ativo.` / `Cupom "X" expirou.` |
| Cupom abaixo do mínimo | `Pedido mínimo de R$ 30,00 pra usar o cupom "MANDA20".` |

## `GET /api/orders/:code`

Mesmo shape do `POST /api/orders`, `restaurant` embutido incluso. 404 se o
código não existir:
`{ statusCode: 404, error: "Not Found", message: "Pedido \"x\" não encontrado." }`.

## `POST /api/coupons/validate`

Request: `{ "code": "MANDA20", "subtotalCents": 6070 }`.

Resposta: `{ "code": "MANDA20", "label": "20% off no pedido", "discountCents": 1214 }`.

Cupom de teste no seed: `MANDA20` (20% off, mínimo R$ 30,00, expira
2026-12-31). Existe também `EXPIRADO10`, inativo, só pra exercitar o caminho
de erro.

**Atenção:** esta validação é só uma prévia pra UI da sacola. `POST
/api/orders` recalcula o desconto de novo a partir do subtotal real do
servidor — nunca confie no `discountCents` desta rota pro pedido final.
