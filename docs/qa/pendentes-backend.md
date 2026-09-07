# Pendências e suposições — backend-agent

Registro das decisões que o `docs/qa/00-briefing-do-lead.md` deixou em aberto.
Segui com a suposição anotada em cada uma e continuei o trabalho — nenhuma
bloqueou a implementação.

## 1. Shape do body de `POST /api/orders`

O briefing definiu o endpoint e as regras de revalidação, mas não o formato
exato do payload. Decidi:

- `restaurantSlug` (não `restaurantId`) — coerente com a decisão A do
  briefing (slug é o identificador público).
- `selectedOptionIds`: lista **achatada** de ids de `ModifierOption`, sem
  agrupar por `ModifierGroup` no payload — o servidor infere o grupo de cada
  opção a partir do cardápio (é ele quem tem a fonte da verdade). Simplifica
  o formulário do modal no frontend: um array de ids marcados, ponto.
- `couponCode` no nível do pedido (não por item).

Documentado em `docs/qa/contrato-api.md`. Se o `frontend-agent` preferir
agrupar por grupo no payload, é mudança de formato sem tocar em regra de
negócio — avisem que eu ajusto.

## 2. 9 restaurantes em vez de 6-8

O briefing pede "6-8 restaurantes cobrindo as categorias da Home". As 8
categorias da Home (`pizza`, `japa`, `burger`, `acai`, `saudavel`, `doces`,
`bebidas`, `brasileira`) não incluem "padaria" — mas a Padaria do Zé é o
restaurante usado em quase todas as telas do handoff (03, 04, 05, 06, 08) e
precisa estar completa e fiel ao mock. Resultado: 8 restaurantes (um por
categoria da Home) + Padaria do Zé como 9º, categoria `padaria`. Ela aparece
normalmente em `GET /api/restaurants` sem filtro, só não é retornada por
nenhum dos 8 tiles de categoria — o que é o comportamento correto (ela não é
uma dessas categorias).

## 3. `qrPayload` — RESOLVIDO por DP-16 + ADR-0013 (2 rodadas)

Minha primeira versão inventava uma assinatura (`?sig=<hash sha256
truncado>`) pra parecer uma "URL assinada de verdade". Corrigido em duas
rodadas:

1. O PO fechou [DP-16](../decisoes-produto.md#dp-16--qr-sem-assinatura-real):
   sem assinatura nenhuma. Removi o `createHash` e o `sig=` — mas usei o
   caminho `https://mandai.app/r/{code}` que o texto de DP-16 cita
   literalmente como exemplo.
2. O lead pegou que `/r/` não é rota de nada — o `ADR-0009` fixa
   `/pedido/[codigo]` como a rota da tela de confirmação, e é essa que o
   `frontend-agent` está construindo. `ADR-0013` (arquiteto) ratificou DP-16
   já usando `https://mandai.app/pedido/{code}`, corrigindo o exemplo de
   DP-16. Ajustei pra esse caminho — `docs/decisoes-produto.md` ainda cita
   `/r/{code}` no texto de DP-16, mas `ADR-0013` é a decisão que prevalece
   (é posterior e é a que efetivamente vira rota real). Não é meu arquivo pra
   editar; sinalizei ao lead.

Formato final: `https://mandai.app/pedido/{code}`, sem `sig=`. `docs/erd.md`
também foi corrigido (a descrição do campo dizia "URL assinada").

## 4. `GET /api/restaurants` não devolve cardápio

A listagem devolve só os campos de card (sem `sections`/`openingHours`/
`addressLine`/`phone`) — o detalhe completo é só em `GET /api/restaurants/:slug`.
O briefing não é explícito sobre isso, mas é a leitura natural de "devolve o
restaurante **com** openingHours, sections..." estar descrita só na linha do
endpoint de detalhe. Evita mandar ~30 itens de cardápio em toda listagem da
Home.

## 5. `Order.status`

`docs/erd.md` marca os 4 valores de status como "proposta, não requisito" —
implementei mesmo assim (`PLACED` como default ao criar), porque o schema já
precisa da coluna e não custa nada ter o enum certo desde já. Não há
endpoint pra transicionar status (não tem tela de acompanhamento no MVP,
conforme o próprio ERD registra).

## 6. Formato de erro

Segui literalmente "formato padrão do Fastify" — `{ statusCode, error,
message }` com `error` sendo o reason phrase HTTP (`"Bad Request"`, `"Not
Found"`), não o nome da classe `HttpError`. `HttpError` em
`src/shared/errors.ts` mapeia o código pro reason phrase.

## 7. Correções aplicadas após as decisões do PO e a auditoria do arquiteto

Rodada de ajustes depois de `docs/decisoes-produto.md`,
`docs/qa/respostas-po.md` e `docs/qa/conformidade-arquitetura.md`:

- **Ficha do restaurante ausente em `GET /api/orders/:code`** (achado do
  `architect-agent`, P-01 do PO): `GetOrderUseCase` agora recebe
  `RestaurantRepository` também (igual `CreateOrderUseCase` já fazia) e a
  resposta de `POST /api/orders`/`GET /api/orders/:code` embute
  `restaurant: { slug, name, addressLine, neighborhood, city, phone,
  coverUrl, logoUrl }`. `restaurantId` continua no payload por conveniência
  de debug, mas o frontend deve usar o objeto `restaurant`.
- **DP-16** (`qrPayload` sem assinatura) — ver item 3 acima.
- **DP-24** (nome obrigatório, 2–60 caracteres) — adicionado no zod de
  `POST /api/orders` com a cópia de erro exata do PO, e reforçado no
  `CreateOrderUseCase` (defesa em profundidade, caso o use case seja chamado
  fora da rota HTTP).
- **DP-03/DP-05** (ordenação) — `GET /api/restaurants` ganhou `?sort=`
  (`distance` padrão, `popular` por `reviewCount` desc), nas duas
  implementações de repositório.
- **DP-08** (seção de cardápio vazia oculta) — filtrado na borda HTTP
  (`toRestaurantDetail`), não nos repositórios — é decisão de apresentação,
  não de acesso a dado.
- **DP-09, DP-10, DP-11, DP-14, DP-15, DP-18, DP-20** — já implementados como
  o código já estava; nenhuma mudança necessária (confirmados pelo lead como
  "nada muda, siga como está").
- **Cupom (DP-14) não foi cortado** — o lead sinalizou o risco de escopo, mas
  o PO confirmou cupom no MVP e o custo de implementação já estava pago
  (endpoint + revalidação dupla já existiam antes desta rodada). Não há
  corte a registrar aqui.

Re-typechecked (`tsc --noEmit` limpo) e reverificado com curl real depois de
cada mudança — saídas no report enviado ao `team-lead`.

## Sem dúvidas bloqueantes

Nenhuma pergunta chegou a bloquear o trabalho — segui com as suposições
acima e documentei. Se `architect-agent` ou `product-owner-agent` quiserem
ajustar algo, é tudo isolado (contrato HTTP e seed), sem impacto nas 4
camadas do domínio.
