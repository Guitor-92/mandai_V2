# ADR-0005: DDD/Clean enxuto com 1 bounded context

- **Status:** Accepted
- **Data:** 2026-09-06

## Contexto

O ADR-0002 escolheu Clean Architecture como esqueleto do backend. Falta decidir *quanto*
de DDD entra junto.

O estilo DDD/Clean, quando aplicado por completo, traz um conjunto grande de padrões:
múltiplos bounded contexts com contextos delimitados por linguagem ubíqua, agregados
com raízes e invariantes, Result pattern para erros esperados, CQRS separando leitura de
escrita, eventos de domínio para efeitos colaterais, e classes `Mapper` dedicadas para
traduzir entre camadas. Cada um resolve um problema real — em sistemas que têm esse
problema.

O Mandaí não tem nenhum deles. É um app de pedidos com cinco endpoints, um fluxo linear
(descobrir → escolher → sacola → confirmar) e um único conceito central: pedido. Não há
segundo time, não há segundo domínio, não há linguagem ambígua entre áreas do negócio.

A força decisiva é didática. `ARQUITETURA.md` §8 lista explicitamente as "armadilhas a
evitar na fala": não introduzir Result pattern, eventos de domínio, CQRS ou múltiplos
bounded contexts. O público tem conhecimento básico em tech; cada padrão adicional
consome atenção que deveria estar na ideia central de inversão de dependência.

Existe também um risco concreto de aplicar DDD por completo aqui: a estrutura fica
maior que o problema, e o aluno aprende a lição errada — que arquitetura significa
pastas.

## Decisão

**Um único bounded context: `ordering`.** Todo o backend vive em
`src/modules/ordering/`. Restaurantes, cardápio e pedidos são o mesmo contexto — a
única razão de o cardápio existir neste sistema é virar pedido.

Dentro dele, as quatro camadas do ADR-0002 e nada além.

O que fica **deliberadamente de fora**:

- **Múltiplos bounded contexts.** Nada de `catalog/`, `ordering/`, `identity/`. Não há
  fronteira de linguagem que justifique a separação.
- **Result pattern.** Use cases lançam `HttpError` com o status apropriado. O handler
  global de erro em `shared/errors.ts` traduz para a resposta HTTP.
- **CQRS.** Leitura e escrita usam os mesmos repositórios e os mesmos modelos.
- **Eventos de domínio.** Nenhum `OrderPlaced`, nenhum event bus, nenhum handler.
  Quando um pedido é criado, o use case faz o que precisa ser feito, em linha.
- **Classes `Mapper` separadas.** O mapeamento Prisma → domínio é uma função
  `toDomain()` no fim do arquivo do próprio repositório.
- **Agregados formais com raiz e invariantes distribuídas.** `Order` e `OrderItem` têm
  a relação natural de pai e filho, mas não montamos a cerimônia completa de agregado.
- **Interface de repositório genérica** (`IRepository<T>`). Cada interface declara só
  os métodos que os use cases realmente chamam.

O que **fica dentro**, porque carrega a lição:

- Entidades de domínio com regra própria, sem imports de framework.
- **Um** value object, `Money`, que valida valor ≥ 0 e formata em BRL. Um é suficiente
  para o conceito ficar claro; dois seriam repetição.
- Interfaces de repositório no domínio, implementações na infra.
- Use cases como classes com `execute(input)` e dependências pelo construtor.

## Consequências

O backend inteiro cabe em cerca de doze arquivos, e um aluno consegue abrir todos numa
sessão. A relação entre camada e responsabilidade fica visível sem tour guiado, porque
não há camada que exista "por completude".

A regra de ouro do projeto — se uma abstração precisa de explicação antes de ser
entendida, ela não pertence a este repo — fica materializada em código, não só em prosa.

Os custos, ditos sem eufemismo:

- **O tratamento de erro é implícito na assinatura.** `execute()` devolve o caso de
  sucesso e *pode* lançar. O compilador não avisa. Quem consome precisa saber que
  `HttpError` existe, e isso é exatamente o que o Result pattern resolveria.
- **`HttpError` vaza semântica de HTTP para a camada de aplicação.** Um use case
  lançando `404` está falando a língua do transporte, não a do domínio. É uma violação
  consciente de pureza, trocada por menos indireção.
- **Efeitos colaterais futuros não têm onde entrar sem refatoração.** Se um dia
  "pedido criado" precisar disparar notificação ou webhook, isso vai parar dentro do
  `CreateOrderUseCase` e deixá-lo gordo — que é o momento exato em que eventos de
  domínio passariam a valer a pena.
- **Crescer significa refatorar, não estender.** Se surgir um contexto de gestão do
  restaurante (aceitar pedido, marcar pronto, fechar loja), a separação em bounded
  contexts terá que ser feita depois, com código já escrito. Isso é mais caro do que
  ter começado separado — e é uma escolha assumida, porque a maioria dos projetos que
  começam separados nunca precisou.
- **Sem `Mapper` explícito, o mapeamento pode se repetir.** Se o mesmo `toDomain()` for
  necessário em dois repositórios, haverá duplicação ou uma extração improvisada.

Todos esses custos são também material de mentoria: o momento em que cada padrão
descartado passaria a se pagar é justamente o que torna o padrão compreensível.

## Alternativas consideradas

**DDD completo, com múltiplos bounded contexts.** Separar `catalog` (restaurantes,
cardápio) de `ordering` (pedidos) tem um argumento legítimo: são responsabilidades
diferentes, e num sistema real provavelmente seriam times diferentes. Descartado porque
os dois contextos compartilhariam quase todo o modelo e precisariam de uma camada
anticorrupção ou de tradução entre si — três vezes mais código para o mesmo
comportamento, e uma fronteira que o aluno não conseguiria justificar se perguntado.

**Result pattern (`Result<T, E>` / `Either`).** Tornaria os erros esperados explícitos
no tipo de retorno e eliminaria o vazamento de HTTP para a aplicação. Descartado
porque exige, antes, explicar tipos genéricos, união discriminada e um estilo de
encadeamento que não é idiomático em Node — e porque, na prática, todo `execute()`
terminaria em um `if (result.isErr()) throw` na camada HTTP, chegando ao mesmo lugar
por um caminho mais longo. Está explicitamente vetado em `ARQUITETURA.md` §8.

**Eventos de domínio.** Desacoplariam efeitos colaterais da criação do pedido.
Descartado porque não há efeito colateral no MVP: não há e-mail, notificação, webhook
ou integração. Um event bus sem eventos é infraestrutura decorativa.

**CQRS.** Separar modelos de leitura e escrita ajudaria se as listagens exigissem
projeções diferentes das entidades. Descartado porque `GET /api/restaurants` devolve
essencialmente a entidade — não há assimetria a resolver, e a separação duplicaria
tipos sem ganho.

**Repositório genérico (`IRepository<T>` com CRUD padrão).** Reduziria código nas
interfaces. Descartado porque interfaces genéricas escondem o que cada use case
realmente precisa; `findBySlug` declarado explicitamente conta mais sobre o sistema do
que um `findOne(where)` herdado.

**Sem camadas: use cases falando direto com o Prisma nas rotas.** Seria o backend
honesto para um app deste tamanho, e é o que a maioria dos projetos reais deste porte
faz. Descartado porque o objetivo declarado do projeto é ensinar a separação de
camadas — aqui, a arquitetura é o produto, e o app de pedidos é o pretexto.
