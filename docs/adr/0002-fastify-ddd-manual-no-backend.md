# ADR-0002: Fastify + DDD manual no backend

- **Status:** Accepted
- **Data:** 2026-09-06

## Contexto

O backend do Mandaí existe para duas coisas ao mesmo tempo: servir cinco endpoints
REST e **ser o material de aula**. A segunda restringe a primeira.

O conceito-âncora que a mentoria quer entregar é inversão de dependência: "a interface
mora no domínio, a implementação mora na infra". Para isso ficar visível, o aluno
precisa conseguir apontar o dedo para o arquivo onde `PrismaOrderRepository` é passada
para `CreateOrderUseCase`. Se essa ligação acontecer dentro de um container de DI,
resolvida por decorators e metadados em tempo de execução, o conceito vira mágica — e
mágica não se ensina, se decora.

Há também uma força de infraestrutura: a API roda como função serverless na Vercel
(ADR-0004 e a seção 5 do plano). Isso favorece um framework de boot rápido e sem
carga de reflexão/metadata em tempo de inicialização, porque cada cold start paga esse
custo.

## Decisão

O backend é **Fastify + TypeScript**, com Clean Architecture aplicada de forma manual
e explícita.

Um único módulo, `src/modules/ordering/`, com quatro camadas:

- **`domain/`** — entidades (`Restaurant`, `MenuItem`, `Order`), o value object `Money`
  e as **interfaces** de repositório. Zero imports de Fastify ou Prisma. Esta camada
  não sabe que a aplicação é uma API.
- **`application/use-cases/`** — uma classe por caso de uso, com método
  `execute(input)`. Dependências chegam pelo construtor. Erros são exceções
  `HttpError` (404, 400) lançadas direto, sem Result pattern.
- **`infra/`** — implementações Prisma das interfaces do domínio. O mapeamento
  Prisma → domínio é uma função `toDomain()` no fim do próprio arquivo, não uma classe
  `Mapper`.
- **`http/`** — `ordering.routes.ts` é um plugin Fastify que recebe os use cases já
  instanciados e só traduz HTTP ↔ use case. Validação de payload com `zod` +
  `fastify-type-provider-zod`.

A injeção de dependência é uma **factory manual** em `ordering.module.ts`:
`buildOrderingModule(prisma)` instancia os repositórios, injeta nos use cases e
devolve um objeto. `buildApp()` chama essa factory e entrega o resultado ao plugin de
rotas. Sem decorators, sem container, sem `reflect-metadata`.

## Consequências

O wire-up é legível de cima a baixo: um arquivo de vinte linhas mostra o grafo inteiro
de dependências do sistema. Trocar Prisma por um repositório fake em teste é passar
outro objeto para a mesma factory — a inversão de dependência deixa de ser teoria.

O domínio permanece testável sem banco, e a fronteira "nada de Prisma em `domain/`" é
verificável a olho nu, só olhando os imports.

Fastify sobe rápido, o que importa em cold start, e o `fastify-type-provider-zod` faz
o schema de validação e o tipo TypeScript serem a mesma declaração.

Os custos que aceitamos:

- **Boilerplate cresce linearmente.** Cada caso de uso novo é um arquivo, uma classe,
  uma linha na factory. Com cinco use cases isso é confortável; com cinquenta seria
  cansativo, e aí um container passaria a pagar seu preço.
- **A factory é um ponto de edição obrigatório.** Esquecer de registrar um use case
  ali é um erro que só aparece na hora de usar a rota.
- **Ecossistema menor que o do Express.** Menos respostas prontas no Stack Overflow,
  e algumas integrações exigem o wrapper Fastify em vez do middleware genérico.
- **Serverless não é o hábitat nativo do Fastify.** Precisamos do adaptador em
  `src/api/index.ts`, mantendo uma instância singleton entre invocações e emitindo
  `request` no servidor interno. É código de cola que existe só por causa do deploy, e
  ele merece um comentário explicando o porquê.
- **Sem Result pattern, o fluxo de erro é invisível na assinatura.** `execute()`
  devolve o sucesso e *pode* lançar. É uma escolha deliberada de legibilidade sobre
  rigor — quem lê o código precisa saber que `HttpError` existe.

## Alternativas consideradas

**Express.** É o framework mais conhecido e o mais fácil de reconhecer para quem já
viu tutorial de Node. Descartado porque a tipagem em TypeScript é fraca (handlers com
`any` implícito em boa parte do caminho), a validação exige montar a integração com
zod na mão, e o tratamento de erro assíncrono ainda depende de wrapper. Fastify entrega
tipagem de rota, validação e serialização como recursos de primeira classe — e isso é
exatamente o que queremos mostrar funcionando.

**NestJS.** Seria a escolha mais previsível para "DDD em Node": já traz módulos,
camadas e injeção de dependência prontos. Descartado justamente por isso. O container
resolve as dependências por decorator e metadata, e é essa resolução que a mentoria
quer tornar visível. Além disso, Nest carrega um vocabulário próprio grande
(`@Module`, `@Injectable`, providers, `forRoot`, `forFeature`) que competiria pela
atenção com os conceitos de arquitetura. Somando: boot mais pesado em serverless.

**Hono.** Excelente em ambientes serverless e de edge, com boot muito rápido.
Descartado por ser menos difundido no mercado brasileiro — o aluno tem mais chance de
reencontrar Fastify no próximo emprego do que Hono.

**Rotas do Next.js (Route Handlers) no lugar de um backend separado.** Um app, um
deploy, menos configuração. Descartado no ADR-0001 e reafirmado aqui: a separação
física entre `apps/web` e `apps/api` é o que torna as camadas de backend um objeto de
estudo em vez de um detalhe do frontend.

**Container de DI leve (`tsyringe`, `awilix`).** Reduziria a factory manual a
registros declarativos. Descartado porque a factory manual *é* o conteúdo: um aluno
que entende `new UseCase(new Repo(prisma))` entende qualquer container depois; o
contrário não é verdade.
