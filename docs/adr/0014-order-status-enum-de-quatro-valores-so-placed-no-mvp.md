# ADR-0014: `Order.status` — enum de quatro valores, MVP escreve e lê só `PLACED`

- **Status:** Accepted
- **Data:** 2026-09-06

## Contexto

`docs/erd.md` propõe `OrderStatus` como `PLACED | READY | PICKED_UP | CANCELED`,
marcando explicitamente que isso é "proposta, não requisito — não há tela de
acompanhamento no MVP". Nenhuma das 13 telas do handoff mostra um pedido em `READY`,
`PICKED_UP` ou `CANCELED`; a tela `06` desenha só o momento imediatamente após
`POST /api/orders`, que é sempre `PLACED`.

O `product-owner-agent` fechou essa pendência em
[DP-15](../decisoes-produto.md#dp-15--orderstatus-no-mvp): o MVP escreve e lê **só**
`PLACED`, e os outros três valores ficam no enum "reservados", com o significado já
registrado no ERD, mas sem nenhum caminho de código que os produza ou consulte.

Isso levanta uma pergunta que é genuinamente de arquitetura, não só de produto: **o
código deveria declarar um `type OrderStatus` com quatro valores, três deles mortos, ou
encolher para um único valor até que exista uso real para os outros três?** A resposta
não é óbvia à luz do próprio `ARQUITETURA.md` §8, que pede para não introduzir
abstração que "precisa de explicação antes de ser entendida" — um enum com 75% dos
valores inalcançáveis por qualquer código do sistema é, em certo sentido, exatamente
esse tipo de coisa. Por outro lado, a mentoria já ensina modelagem de domínio a partir
do ERD, e um enum contado de propósito é diferente, em espécie, dos padrões vetados no
§8 (Result pattern, eventos de domínio, CQRS) — nenhum deles é "declarar um tipo com
valores não usados ainda", todos eles são "introduzir uma camada de indireção nova".

## Decisão

`OrderStatus` mantém os **quatro** valores do ERD:

```ts
export type OrderStatus = 'PLACED' | 'READY' | 'PICKED_UP' | 'CANCELED';
```

O MVP **produz e consome só `PLACED`**: todo `Order` nasce em `PLACED`
(`CreateOrderUseCase`, que é o único lugar que constrói um `Order`) e nenhum caminho de
código lê `READY`, `PICKED_UP` ou `CANCELED` — não há use case de transição de estado,
não há endpoint `PATCH /api/orders/:code/status`, e a tela de confirmação não ramifica
por status.

Os três valores reservados carregam, só em comentário no código (não em lógica), o
significado que `docs/erd.md` já define — pronto para virar caminho de código real no
dia em que existir um produto do lado do restaurante que precise deles.

## Consequências

O tipo é o retrato fiel do domínio, do jeito que o ERD já argumenta: um pedido
*conceitualmente* passa por esses quatro estados no mundo real (é feito, fica pronto, é
retirado, ou é cancelado), mesmo que o MVP só implemente o primeiro. Um aluno que olhar
o tipo entende o ciclo de vida completo do pedido sem precisar imaginar quais outros
valores fariam sentido — a diferença entre "meia informação" e "informação completa,
com metade ainda sem uso" é real, e a segunda ensina mais.

Quando (e se) a mentoria quiser adicionar "marcar como pronto" como exercício, o tipo
já existe — o trabalho é só escrever o use case e a rota, não voltar e desenhar o
domínio de novo.

Os custos, ditos sem meia-palavra:

- **Três dos quatro valores são código morto no sentido estrito**: nenhum teste,
  nenhuma rota e nenhum use case os alcança. Isso é diferente de "não testado" — é
  "inalcançável por construção" enquanto o MVP for isso que é. Um linter de
  exhaustividade (`switch` sobre `OrderStatus` cobrindo os quatro casos) vai forçar
  quem escrever código futuro a lidar com ramos que nunca acontecem na prática hoje.
- **O enum sozinho não impede alguém de, por engano, aceitar um `status` arbitrário
  vindo do cliente.** Isso não é risco real hoje porque nenhum endpoint aceita
  `status` como input — `POST /api/orders` sempre cria em `PLACED` internamente, nunca
  a partir de um campo do payload. Vale registrar como invariante a proteger se um dia
  existir um endpoint de transição.
- **A tentação de "aproveitar" os valores reservados para atalhos** (por exemplo, usar
  `CANCELED` informalmente em algum script de seed para simular erro) deve ser evitada
  — um valor "reservado sem uso" que passa a ter um uso não documentado nesta decisão
  vira uma segunda fonte de verdade sobre o que aquele enum member significa.

## Alternativas consideradas

**Encolher o tipo para `type OrderStatus = 'PLACED'`** (ou eliminar o campo
`status` inteiramente, já que só existe um valor possível). Reduziria a zero o código
morto. Descartado porque o ERD (documento de domínio, autoridade sobre modelagem,
`docs/erd.md`) já argumenta que os quatro estados existem conceitualmente no negócio —
encolher o tipo aqui obrigaria reescrevê-lo por completo assim que o primeiro exercício
de "marcar pronto" aparecesse, e essa reescrita aconteceria bem no meio da aula errada
(a de outro assunto). Diferente de Result pattern ou CQRS, o custo de manter os quatro
valores agora é zero linhas de lógica — só é uma linha de tipo — enquanto encolher e
crescer de novo depois custa uma migração e uma decisão de modelagem repetida.

**Adicionar um caminho de código mínimo para as transições** (endpoint
`PATCH /api/orders/:code/status`, mesmo sem UI que o chame), só para o enum não ficar
"morto". Descartado porque construiria uma rota pública de escrita sem nenhuma US que a
peça e sem autenticação (ADR-0006) protegendo quem pode transicionar um pedido —
exatamente o tipo de superfície de abuso que o ADR-0006 já assume como risco aceito
para o que existe, sem motivo para aumentá-la por simetria com o enum.

**Documentar os quatro valores só em `docs/erd.md`, sem declarar `type OrderStatus`
no TypeScript** — deixar `status: string` solto. Descartado porque joga fora, de graça,
a checagem de tipo que o TypeScript dá sem custo nenhum: `status: string` aceita
qualquer string, `status: OrderStatus` não. É o tipo de rigor que "custa zero, ensina
alguma coisa", ao contrário dos padrões vetados no §8.
