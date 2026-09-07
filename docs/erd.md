# ERD — Mandaí

Modelo de domínio do Mandaí (pedidos para retirada no balcão). Espelha
`apps/api/prisma/schema.prisma`, mas vive como **documento de domínio independente**:
é aqui que a discussão acontece antes de mexer no schema.

> **Regra de manutenção:** todo commit que altera `prisma/schema.prisma` altera este
> arquivo no mesmo commit.

Valores monetários são sempre **inteiros em centavos** (`priceCents`, `totalCents`).
Nunca `float` — `R$ 18,90` é `1890`.

---

## Diagrama

```mermaid
erDiagram
  %% ─────────── Cardápio (lado da leitura) ───────────
  Restaurant    ||--o{ OpeningHour    : "1 restaurante define 0..N faixas de horário"
  Restaurant    ||--o{ MenuSection    : "1 restaurante organiza 0..N seções de cardápio"
  MenuSection   ||--o{ MenuItem       : "1 seção contém 0..N pratos"
  MenuItem      ||--o{ ModifierGroup  : "1 prato oferece 0..N grupos de escolha"
  ModifierGroup ||--|{ ModifierOption : "1 grupo lista 1..N opções"

  %% ─────────── Pedido (lado da escrita) ───────────
  Restaurant    ||--o{ Order          : "1 restaurante recebe 0..N pedidos"
  Order         ||--|{ OrderItem      : "1 pedido tem 1..N linhas (nunca vazio)"
  MenuItem      ||--o{ OrderItem      : "1 prato originou 0..N linhas (FK opcional)"
  Coupon        ||--o{ Order          : "1 cupom desconta em 0..N pedidos (opcional)"

  Restaurant {
    string   id              PK "cuid"
    string   slug            UK "padaria-do-ze — usado na URL do restaurante"
    string   name               "Padaria do Zé"
    string   category           "slug da cozinha: padaria, pizza, japa..."
    string   tags               "Padaria · Café · Brunch (linha do card)"
    float    rating             "4.8 — exibido como 4,8"
    int      reviewCount        "1247 avaliações"
    int      distanceMeters     "1200 — formatado como 1,2 km"
    int      prepTimeMinutes    "18 — o Pronto em ~18 min"
    bool     isOpen             "estado agora; a tela 07 depende disso"
    string   coverUrl           "capa 1600px"
    string   logoUrl            "avatar 88px da ficha"
    string   addressLine        "R. Wisard, 348"
    string   neighborhood       "Vila Madalena — pickup pill e busca"
    string   city               "São Paulo"
    string   phone              "(11) 2389-0042 — botão Ligar"
  }

  OpeningHour {
    string id           PK
    string restaurantId FK
    int    dayOfWeek       "0=domingo .. 6=sábado"
    int    opensAtMinutes  "420 = 7h"
    int    closesAtMinutes "780 = 13h"
  }

  MenuSection {
    string id           PK
    string restaurantId FK
    string name            "Mais pedidos da casa"
    int    position        "ordem na nav lateral com scrollspy"
  }

  MenuItem {
    string id          PK
    string sectionId   FK
    string name           "Tapioca de queijo coalho"
    string description    "texto do card e do modal"
    int    priceCents     "1890"
    string imageUrl       "foto 400/1200px"
    string availability   "AVAILABLE | LOW_STOCK | OUT_OF_STOCK"
    bool   isPopular      "badge Mais pedido da casa"
    string promoLabel     "10% off — nulo quando não há promo"
  }

  ModifierGroup {
    string id         PK
    string menuItemId FK
    string name          "Escolha o acompanhamento"
    string helperText    "Escolha 1 opção"
    int    minSelect     "1 = obrigatório, 0 = opcional"
    int    maxSelect     "1 = radio, maior que 1 = checkbox"
    int    position      "ordem dentro do modal"
  }

  ModifierOption {
    string id      PK
    string groupId FK
    string name       "Queijo coalho extra"
    int    priceDelta "500 = + R$ 5,00; 0 = Grátis"
    bool   available  "a opção pode esgotar sozinha"
    int    position
  }

  Order {
    string   id            PK "cuid — o #A8B2C9F1 da tela 06"
    string   code          UK "MA-7K2D — maiúsculo, sem 0/O/1/I"
    string   restaurantId  FK "sacola é mono-restaurante"
    string   couponCode    FK "nulo quando não há cupom"
    string   customerName     "Marina — único dado pessoal coletado"
    string   status           "PLACED | READY | PICKED_UP | CANCELED"
    int      subtotalCents    "soma das linhas"
    int      discountCents    "desconto congelado no momento do pedido"
    int      totalCents       "subtotal menos desconto; retirada é sempre grátis"
    string   qrPayload        "URL determinística lida no balcão — sem assinatura real no MVP (DP-16)"
    datetime estimatedReadyAt "createdAt + prepTimeMinutes"
    datetime createdAt
  }

  OrderItem {
    string id                 PK
    string orderId            FK
    string menuItemId         FK "opcional — o prato pode ser deletado depois"
    string nameSnapshot          "nome no momento do pedido"
    int    priceCentsSnapshot    "preço unitário base no momento do pedido"
    int    qty                   "1..20 (stepper do modal)"
    json   modifiers             "[{ group, option, priceDelta }] — congelado"
    string note                  "recado pro restaurante, máx 140 char"
    int    lineTotalCents        "(base + modificadores) vezes qty"
  }

  Coupon {
    string   code         PK "MANDA20"
    string   label           "rótulo exibido na linha de desconto"
    int      percentOff      "20 — nulo se for desconto fixo"
    int      amountOffCents  "nulo se for percentual"
    int      minSubtotal     "pedido mínimo em centavos"
    datetime expiresAt
    bool     active
  }
```

---

## Por que assim

### Snapshots em `OrderItem` (a decisão central)

`OrderItem` não confia no `MenuItem` para exibir o pedido. Ele copia `nameSnapshot`,
`priceCentsSnapshot` e o array `modifiers` no instante do checkout.

O motivo é que **um pedido é um fato histórico, não uma consulta ao cardápio de agora**.
O restaurante reajusta o preço da tapioca na terça; o pedido de segunda tem que continuar
mostrando `R$ 18,90` e somando o mesmo total. Sem snapshot, abrir o pedido `MA-7K2D` uma
semana depois reescreveria o passado — e o valor mostrado não bateria com o que a pessoa
pagou no balcão.

Pela mesma razão `menuItemId` é **opcional**: se o prato sair do cardápio, a linha do
pedido sobrevive. A FK serve para "pedir de novo" e para relatórios, nunca para renderizar.

`modifiers` fica como **JSON** (§4.1 do plano) em vez de uma tabela `OrderItemModifier`:
os modificadores escolhidos só são lidos em bloco, junto da linha, e nunca consultados de
forma independente. Uma tabela extra aqui custaria um join e mais um conceito na mentoria
sem pagar nada de volta.

### A assimetria cardápio ↔ pedido

Do lado do **cardápio**, modificadores são tabelas (`ModifierGroup` / `ModifierOption`);
do lado do **pedido**, são JSON. Não é inconsistência — são responsabilidades diferentes:

- No cardápio eles carregam **regra de negócio**. `minSelect`/`maxSelect` são o que faz o
  modal da tela 04 exibir radio obrigatório para "Escolha o acompanhamento" e checkbox
  livre para "Adicionais", e é o que `POST /api/orders` precisa **revalidar no servidor**
  (nunca confie no cliente para afirmar que a escolha obrigatória foi feita).
- No pedido eles são **dado morto**: já foram escolhidos, já entraram na conta.

`minSelect`/`maxSelect` como inteiros, em vez de um booleano `required`, cobrem os dois
casos do design com um vocabulário só — e ainda deixam "escolha até 3" possível sem
migração.

### `availability` em vez de `available: bool`

A tela 08 tem **três** estados visuais, não dois: normal, `Últimas unidades` (badge manga)
e `Esgotado` (item cinza, botão vira "Me avisa"). Um booleano perde o estado do meio, que
é justamente o que gera urgência. Daí o enum de três valores.

### `OpeningHour` separado de `isOpen`

`isOpen` responde "posso pedir agora?" — é o que a Home e o card precisam, e é barato.
Mas a tela 07 mostra a **grade semanal** ("Seg–Sex 7h – 13h · Domingo Fechado") e a frase
"abre amanhã às 7h", que só sai de horários estruturados. Guardar minutos desde a
meia-noite (`420` = 7h) evita fuso, formatação e comparação de string.

### O que **não** virou tabela

- **Sacola.** Ela vive no `localStorage` do navegador (§3.2 do plano) e só existe no
  servidor quando vira `Order`. Não há entidade `Cart` — é por isso que `Order` já nasce
  com no mínimo uma linha (`||--|{`). A regra "sacola é mono-restaurante" fica garantida
  por `Order.restaurantId` ser único por pedido.
- **User / Customer.** Não há cadastro no MVP (§11). O único dado pessoal é
  `Order.customerName`, digitado no checkout só para gerar o código do balcão.
- **Category.** Segue como string em `Restaurant.category`, conforme §4.1. Emoji e cor de
  fundo dos 8 tiles da Home são constantes do frontend, não dados — se um dia o
  `GET /api/categories` do handoff precisar ser dinâmico, aí vira tabela.
- **Pagamento.** Mandaí é pickup e se paga no balcão (§11). Nada de transação aqui.

---

## Além da seção 4.1 do plano

Quatro entidades não estão no `ARQUITETURA.md` §4.1. Todas nasceram das telas, e cada uma
tem uma saída mais barata se a mentoria quiser encolher o escopo:

| Entidade | Tela que exige | Alternativa mais enxuta |
|---|---|---|
| `ModifierGroup` / `ModifierOption` | 04 · Adicionar item | JSON em `MenuItem.modifiersJson` (zero tabelas, mas sem validação no servidor) |
| `OpeningHour` | 07 · Restaurante fechado | manter só `isOpen` + um campo texto `hoursTodayLabel` |
| `Coupon` | 05 · Sacola (`MANDA20`) | US-07 é opcional: cortar a entidade e manter `couponCode`/`discountCents` só no `Order` |

Os grupos de modificadores são os menos dispensáveis: sem eles a tela 04 não tem o que
renderizar e o endpoint `GET /api/restaurants/:slug/items/:itemId` do handoff fica sem
resposta.

## Pendências a resolver via ADR

- **Identificador de restaurante.** Este ERD usa `slug` na URL (handoff) e `id` como PK;
  o §4.1 do plano fala em `/restaurante/:id`. Escolher um e registrar.
- **Estados de `Order.status`.** O design só desenha o pedido confirmado. Os quatro
  valores acima são proposta, não requisito — não há tela de acompanhamento no MVP.
- **"Me avisa quando abrir/voltar".** Os botões das telas 07 e 08 coletam contato, mas
  nenhuma entidade guarda isso ainda. Fora do MVP; se entrar, vira `StockAlert`.
