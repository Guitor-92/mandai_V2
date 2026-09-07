# ADR-0010: Superfície da API v0.1.0

- **Status:** Accepted
- **Data:** 2026-09-06

## Contexto

`CLAUDE.md` registra a segunda divergência conhecida: o plano (`ARQUITETURA.md` §2.4)
define cinco endpoints; o handoff espera também `GET /api/categories` e
`GET /api/restaurants/:slug/items/:itemId`, além de `POST /api/coupons/validate` para
o fluxo de cupom (US-07, marcada opcional). Era preciso fechar a superfície completa da
API antes que backend e frontend integrassem em paralelo — um contrato ambíguo nesse
ponto vira retrabalho dos dois lados ao mesmo tempo.

Três perguntas específicas precisavam de resposta:

1. **`GET /api/categories` existe?** O handoff assume que sim (os 8 tiles de categoria
   da Home viriam de uma chamada de API).
2. **`GET /api/restaurants/:slug/items/:itemId` existe?** O handoff assume que sim,
   para o modal de adicionar item (tela 04) buscar o detalhe do prato sob demanda.
3. **Como o formato de erro e a unidade monetária atravessam a fronteira HTTP**, dado
   que o backend é Fastify (ADR-0002) e o domínio trabalha com o VO `Money` em
   centavos.

`docs/erd.md`, na seção "O que não virou tabela", já havia adiantado a resposta da
primeira pergunta ao decidir que categoria é string constante do frontend — mas isso
vivia num documento de modelo de dados, não de contrato de API, e precisava ser
formalizado como decisão de superfície. A segunda pergunta dependia de examinar o que
`GET /api/restaurants/:slug` já devolve: se o cardápio completo, com todos os
modificadores, já vem embutido na resposta do restaurante, o endpoint de item
individual não tem nenhum dado novo para buscar.

## Decisão

A API v0.1.0 expõe **sete** endpoints:

| Método | Path | Serve |
|---|---|---|
| GET | `/api/health` | smoke test |
| GET | `/api/restaurants?category=&q=` | US-01, US-02 |
| GET | `/api/restaurants/:slug` | US-04, US-05, US-09 |
| GET | `/api/search?q=` | US-03 |
| POST | `/api/orders` | US-08 |
| GET | `/api/orders/:code` | US-08 |
| POST | `/api/coupons/validate` | US-07 (opcional) |

`GET /api/restaurants/:slug` devolve o restaurante **com o cardápio completo**
embutido: `openingHours[]`, `sections[].items[].modifierGroups[].options[]`. Não é uma
resposta enxuta com IDs para buscar depois — é a árvore inteira que a tela 03 (e o
modal 04, que abre a partir dela) precisa para renderizar sem nenhuma segunda
requisição.

`GET /api/search?q=` devolve `{ restaurants, items }` — dois arrays, porque a US-03
("buscar por nome de restaurante ou prato") e a tela 11 do handoff pedem resultados
combinados numa única chamada, não duas buscas independentes disparadas pelo cliente.

`POST /api/coupons/validate` é implementado apesar de US-07 ser opcional: o cupom
`MANDA20` já está desenhado na tela 05 do handoff e a validação (existe, está ativo,
não expirou, subtotal atinge o mínimo) é barata de escrever dado que `Coupon` já é
entidade no ERD. Implementar o endpoint agora custa pouco e evita que o frontend
precise simular a validação no cliente, o que abriria uma inconsistência entre "o que a
tela mostra" e "o que o servidor cobraria".

**Duas ausências deliberadas** em relação ao que o handoff assume:

- **Não existe `GET /api/categories`.** `docs/erd.md`, na seção "O que não virou
  tabela", já havia decidido isso do lado do modelo de dados: as 8 categorias da Home
  são uma constante do frontend — nome, emoji e cor de fundo de cada tile são decisão
  de *design*, não dado que varia em runtime. `Restaurant.category` continua sendo uma
  string simples, usada como filtro (`?category=`) contra os valores dessa constante.
  Este ADR fecha a mesma decisão do lado da superfície de API: se um dia as categorias
  precisarem ser geridas dinamicamente (adicionar uma categoria sem deploy do
  frontend), aí sim o endpoint se justifica — e vira um ADR novo.
- **Não existe `GET /api/restaurants/:slug/items/:itemId`.** Já respondida pela
  decisão acima sobre o formato de `GET /api/restaurants/:slug`: o cardápio completo,
  com todos os grupos de modificadores e opções, já veio na resposta do restaurante. O
  modal de adicionar item (tela 04, ADR-0009 confirma que é overlay e não rota) abre a
  partir do array de itens que a página `/restaurante/[slug]` já tem em memória — não
  há necessidade de rede para obter um dado que já está no cliente. Buscar de novo por
  uma rota dedicada duplicaria a resposta de `GET /api/restaurants/:slug` sem ganhar
  nada em troca, e criaria dois formatos de "item" para manter sincronizados.

**Formato de erro:** `{ statusCode, error, message }`. Este é literalmente o formato
que o `setErrorHandler` padrão do Fastify produz a partir de uma exceção lançada com
`statusCode` — que é a forma de `HttpError` descrita no ADR-0002 e no `ARQUITETURA.md`
§2.2. Não há schema de erro customizado a manter: o handler global em
`shared/errors.ts` traduz qualquer `HttpError` para essa forma, e erros não previstos
caem no 500 padrão do Fastify, que já usa o mesmo formato.

**Dinheiro em centavos inteiros, sempre, na fronteira HTTP.** Toda resposta que carrega
valor monetário (`priceCents` de item, `priceDelta` de modificador, `subtotalCents`,
`discountCents`, `totalCents` de pedido) devolve `number` inteiro em centavos. A API
**nunca** devolve string já formatada em BRL (`"R$ 18,90"`) nem `float`. Formatação
para exibição — o `R$`, a vírgula decimal — é responsabilidade exclusiva do frontend,
de acordo com o VO `Money` no domínio (`ARQUITETURA.md` §2.2, §4.1) e a regra já
registrada em `docs/erd.md` ("Valores monetários são sempre inteiros em centavos").
Isso vale tanto para o que a API devolve quanto para o que ela aceita no corpo de
`POST /api/orders`: o cliente envia `qty` e a seleção de modificadores, nunca um total
calculado — porque, como a próxima decisão formaliza, o total nunca vem do cliente.

**`POST /api/orders` revalida tudo no servidor**, sem confiar em nenhum valor calculado
que o cliente eventualmente envie:

- Cada `MenuItem` referenciado existe e está com `availability` diferente de
  `OUT_OF_STOCK`.
- Cada `ModifierGroup` do item respeita `minSelect`/`maxSelect` com o que foi
  selecionado — uma escolha obrigatória ausente ou uma escolha além do máximo permitido
  é rejeitada com 400, não silenciosamente aceita.
- O restaurante está `isOpen` no momento da criação do pedido.
- Todas as linhas do pedido referenciam o **mesmo** restaurante — a regra "sacola é
  mono-restaurante" (`docs/erd.md`) é imposta aqui, no único lugar em que a sacola vira
  dado de servidor.
- `subtotalCents`, `discountCents` (se houver cupom) e `totalCents` são **recalculados
  a partir do banco** — preço de item, `priceDelta` de cada modificador selecionado, e
  regra do cupom — e o que o cliente eventualmente tiver mandado como total é
  descartado. O valor que entra no `nameSnapshot`/`priceCentsSnapshot` de cada
  `OrderItem` é o valor que o servidor calculou, não o que o cliente exibia na tela.

## Consequências

O contrato fica fechado e simétrico ao ERD: nenhuma resposta expõe um endpoint sem
dado real por trás, e nenhuma decisão de modelagem (categoria como constante, cardápio
completo embutido) fica só documentada no ERD sem reflexo na API.

O frontend ganha uma chamada a menos por navegação — a tela de cardápio e o modal de
item compartilham uma única busca — o que é bom tanto para simplicidade quanto para
performance percebida.

A revalidação total em `POST /api/orders` centraliza toda regra de negócio de pedido no
`CreateOrderUseCase`, que é exatamente o lugar que o ADR-0002 e o ADR-0005 elegem para
isso — nenhuma regra de disponibilidade ou de modificador obrigatório vaza para o
handler HTTP nem para o frontend.

Custos assumidos:

- **Sem `GET /api/categories`, adicionar uma categoria nova é sempre um deploy do
  frontend**, nunca só um dado novo no banco. Para o volume de 8 categorias fixas do
  MVP isso é aceitável; é o primeiro candidato a virar tabela se o produto crescer.
- **A resposta de `GET /api/restaurants/:slug` é necessariamente grande** — carrega
  seções, itens, grupos e opções numa árvore só. Para o volume do seed (6-8
  restaurantes, ~30 itens) isso é irrelevante; um catálogo maior justificaria paginação
  ou carregamento sob demanda por seção, que este ADR não prevê.
- **A revalidação completa em `POST /api/orders` é o único caminho de escrita não
  trivial do sistema** — o único use case que faz mais de uma leitura, cruza dados e
  decide antes de persistir. É também, por isso, o candidato natural a concentrar bug
  se a lógica de `minSelect`/`maxSelect` crescer; hoje ela é simples o bastante para
  caber num único método sem decomposição adicional.
- **Erro em formato Fastify-padrão amarra a resposta de erro ao framework escolhido no
  ADR-0002.** Trocar de framework HTTP no futuro exigiria também redefinir o formato de
  erro — um acoplamento aceito conscientemente em troca de zero código customizado
  hoje.
- **Cupom implementado apesar de opcional (US-07) é escopo a mais que o MVP
  estritamente exige.** Se o tempo apertar, `POST /api/coupons/validate` é o primeiro
  candidato a cortar sem quebrar o fluxo principal — nenhuma outra US depende dele.

## Alternativas consideradas

**Manter `GET /api/categories` como endpoint que devolve a constante do servidor**, só
para o frontend não hardcodar nada. Descartado porque moveria uma decisão de design
(emoji e cor de cada tile) para o backend sem ganhar flexibilidade real — ninguém edita
categoria em runtime no MVP — e criaria uma chamada de rede extra na Home só para
buscar um array que nunca muda entre deploys.

**Manter `GET /api/restaurants/:slug/items/:itemId` para um modal mais "RESTful".**
Deixaria a URL do modal, se algum dia virasse rota, mapeável 1:1 a uma chamada de API.
Descartado porque, como o ADR-0009 decide, o modal não é rota — e buscar de novo um
dado que a página pai já tem é o tipo exato de indireção que `ARQUITETURA.md` pede para
evitar: "se uma abstração precisa de explicação antes de ser entendida, ela não
pertence a este repo".

**Devolver dinheiro como string formatada (`"R$ 18,90"`) na API**, poupando o frontend
de formatar. Descartado porque acopla a API a uma localidade e a um formato de exibição
— o dia em que o frontend quiser mostrar `18,90` sem o `R$` (como em um resumo
compacto), teria que fazer parsing de string para obter o número de volta. Centavos
inteiros são a representação canônica; formatação é sempre depois, sempre no frontend,
sempre a partir do mesmo número.

**Confiar no total calculado pelo cliente em `POST /api/orders`, revalidando só
disponibilidade.** Menos código no `CreateOrderUseCase`. Descartado categoricamente: um
pedido cujo total vem do cliente é uma vulnerabilidade de preço trivial de explorar (
interceptar a requisição e trocar `totalCents`), e "nunca confiar no cliente para
afirmar valor monetário ou escolha obrigatória" é citado explicitamente no briefing do
lead e implícito em toda a lógica de `docs/erd.md` sobre `ModifierGroup`.

**Formato de erro customizado, com código de erro semântico** (`{ code: "ITEM_OUT_OF_STOCK", message }`)
em vez do formato genérico do Fastify. Daria ao frontend uma forma de reagir a erros
específicos sem fazer parsing de string. Descartado para o MVP porque nenhuma tela
hoje distingue tipos de erro 400 de forma diferente — a US-09 pede "mensagem clara",
não comportamento condicional por tipo de erro — e o formato padrão do Fastify já
resolve isso com zero código adicional. Fica registrado como extensão natural se o
frontend precisar de reação diferenciada por tipo de erro no futuro.
