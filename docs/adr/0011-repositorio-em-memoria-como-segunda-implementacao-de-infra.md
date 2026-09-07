# ADR-0011: Repositório em memória como segunda implementação de infra

- **Status:** Accepted
- **Data:** 2026-09-06

## Contexto

O ADR-0004 escolheu Prisma + Neon Postgres como alvo de produção do Mandaí, e essa
decisão **continua valendo** — este ADR não a contesta nem a substitui. O problema é
operacional e imediato: nesta máquina, hoje, não existe `DATABASE_URL` configurada e
não há projeto Neon criado (briefing do lead, item D). Backend e frontend estão sendo
escritos em paralelo, e a release 0.1.0 precisa ser verificável ponta a ponta —
`ARQUITETURA.md` §10 pede exatamente isso: `apps/api` responde no seed, `apps/web`
renderiza, o fluxo completo chega à confirmação com código `MA-XXXX`. Nada disso é
demonstrável se a API não sobe sem banco.

Esperar o provisionamento do Neon bloquearia os dois times de desenvolvimento por uma
tarefa que é puramente administrativa (criar conta, criar projeto, configurar
integração com a Vercel) e que não ensina nada de arquitetura. A alternativa óbvia —
mockar a resposta HTTP inteira só para destravar o frontend — resolveria o sintoma sem
resolver o problema: o backend continuaria sem poder rodar sozinho, e o
`CreateOrderUseCase` nunca seria exercitado de verdade antes do banco existir.

Havia, porém, uma saída que a própria arquitetura do ADR-0002 já deixa pronta para ser
usada: a interface de repositório mora no domínio, e Prisma é **uma** implementação
dela, não a única possível por construção. Se isso é verdade, uma segunda
implementação — sem banco nenhum, guardando dado em memória do processo — deveria ser
plenamente intercambiável com a primeira, sem que nenhum use case precise saber qual
das duas está rodando por trás. Essa é, literalmente, a definição de inversão de
dependência que a mentoria quer ensinar (ADR-0002) — só que agora ela aparece como
solução de um problema real de infraestrutura, não como exercício isolado.

## Decisão

`apps/api/src/modules/ordering/infra/` ganha uma segunda família de repositórios,
paralela à Prisma:

- `in-memory-restaurant.repository.ts`
- `in-memory-order.repository.ts`

Ambas implementam as **mesmas interfaces** de `domain/repositories/` que as
implementações Prisma implementam — `findBySlug`, `search`, `create`, `findByCode`, e
o que mais os use cases declararem precisar. Nenhum método a mais, nenhum a menos: a
interface é o contrato, e as duas implementações o cumprem de formas diferentes.

As duas implementações **leem a partir da mesma fonte de dado**:
`apps/api/prisma/seed-data.ts` — um módulo TypeScript puro (arrays e objetos
tipados, sem import de Prisma nem de banco) que descreve os 6-8 restaurantes e os ~30
itens do seed. `prisma/seed.ts` (o script de seed do Prisma, ADR-0004) importa esse
módulo e grava no Postgres via `PrismaClient`; o repositório em memória importa o
**mesmo** módulo e mantém os dados em estruturas do próprio processo Node (arrays,
`Map`), sem nenhuma escrita em disco ou banco. Não existem dois conjuntos de dados de
seed para divergir — existe um dado, dois consumidores.

`ordering.module.ts` decide qual família instanciar checando `process.env.DATABASE_URL`
no momento do boot:

```ts
export function buildOrderingModule() {
  const hasDatabase = Boolean(process.env.DATABASE_URL);

  const restaurantRepo = hasDatabase
    ? new PrismaRestaurantRepository(getPrismaClient())
    : new InMemoryRestaurantRepository(seedData);

  const orderRepo = hasDatabase
    ? new PrismaOrderRepository(getPrismaClient())
    : new InMemoryOrderRepository(seedData);

  // use cases recebem restaurantRepo/orderRepo sem saber qual implementação é
  return { listRestaurants: new ListRestaurantsUseCase(restaurantRepo), /* ... */ };
}
```

Nenhum use case, nenhuma rota HTTP, e nenhum teste de use case precisa saber qual das
duas implementações está ativa — é exatamente o ponto. O log de boot da API imprime
qual modo está ativo (`"[ordering] usando repositório em memória (DATABASE_URL ausente)"`),
para que ninguém rodando localmente confunda os dois modos por acidente.

Escrita em memória (`POST /api/orders`) persiste **apenas durante a vida do processo**:
reiniciar `npm run dev` sem `DATABASE_URL` reseta os pedidos criados de volta ao estado
do seed. Isso é aceito como comportamento do modo em memória, não corrigido — não há
pretensão de durabilidade nesse caminho.

## Consequências

A release fica verificável hoje, sem depender de nenhum provisionamento externo: um
clone do repositório roda `npm install && npm run dev` em `apps/api` sem
`.env` nenhum e já responde `GET /api/restaurants` com o seed. Isso é, aliás, um ganho
didático que nem o próprio `ARQUITETURA.md` §7 havia planejado — a barreira de entrada
para rodar o backend fica menor ainda do que "criar conta no Neon".

Mais importante para o objetivo declarado do projeto: agora existem **duas**
implementações reais e não triviais da mesma interface de domínio rodando lado a lado
no mesmo repositório. Isso torna "a interface mora no domínio, a implementação mora na
infra" uma coisa que se demonstra trocando uma variável de ambiente, não só uma frase
que se explica com um diagrama. É o tipo de prova que fica na memória de quem está
aprendendo.

Os custos, sem eufemismo:

- **Dois caminhos de dado para manter em sincronia.** Toda vez que a interface de
  repositório ganhar um método novo, as duas implementações precisam ganhá-lo junto —
  esquecer uma das duas quebra silenciosamente só o modo que ninguém está testando
  naquele momento. Isso é atrito real de manutenção, proporcional ao número de métodos
  na interface (hoje pequeno, por causa do ADR-0005 vetar repositórios genéricos).
- **Risco concreto de divergência de comportamento entre Prisma e memória**,
  particularmente em dois pontos que Postgres resolve "de graça" e uma estrutura em
  memória precisa replicar à mão:
  - **Ordenação.** `findMany` do Prisma com `orderBy` usa a colação do Postgres; um
    `.sort()` sobre array em memória usa a comparação padrão do JavaScript. Para os
    campos usados hoje (nome, distância, rating) o resultado prático coincide, mas não
    há garantia formal de que sempre coincidirá — é um ponto a testar manualmente
    sempre que um novo critério de ordenação for adicionado.
  - **Busca.** `search` no Prisma provavelmente usa `contains`/`ILIKE`
    (case-insensitive, com collation do banco); a versão em memória precisa replicar
    "case-insensitive" manualmente (`.toLowerCase()` dos dois lados) para não devolver
    resultados diferentes dependendo do modo. Isso é um teste de paridade que **não
    existe automatizado** neste ADR — fica como risco assumido e como candidato natural
    a teste automatizado (`describe.each` rodando a mesma suíte contra as duas
    implementações) se o projeto crescer.
- **`POST /api/orders` em memória não é durável.** Ensinar isso errado — alguém
  assumir que o modo em memória "funciona igual" ao Postgres em todos os aspectos —
  seria pior do que não ter o modo. O log de boot explícito existe para mitigar essa
  confusão.
- **O ADR-0004 continua sendo o alvo de produção.** Este ADR não o supera porque não
  discorda dele — Postgres continua sendo a implementação correta para dado que precisa
  sobreviver a um restart e a múltiplas instâncias da função serverless. A implementação
  em memória é estritamente um modo de desenvolvimento/demonstração sem infraestrutura,
  nunca um caminho de deploy.
- **`seed-data.ts` vira um arquivo com duas responsabilidades para agradar.** Precisa
  ser ao mesmo tempo "dado fácil de inserir via Prisma" e "dado fácil de consultar em
  memória (por slug, por categoria, por texto)" — o formato escolhido (arrays de
  objetos simples, tipados igual às entidades de domínio) atende aos dois, mas qualquer
  necessidade futura de um lado (por exemplo, o Prisma precisar de um campo de relação
  que a busca em memória não usa) tensiona o arquivo nas duas direções.

## Alternativas consideradas

**Esperar o provisionamento do Neon antes de os devs escreverem infra.** Seria mais
simples — uma implementação só, sem risco de divergência. Descartado porque bloquearia
dois agentes trabalhando em paralelo por uma tarefa administrativa, e a release 0.1.0
não teria como ser verificada ponta a ponta na janela de tempo disponível.

**Mockar a resposta HTTP no frontend (MSW ou fixture estática), sem subir o backend de
verdade.** Destravaria só o frontend, mais rápido. Descartado porque deixaria o backend
sem verificação nenhuma — nenhum use case seria exercitado, nenhuma rota testada de
ponta a ponta — e adiaria para depois exatamente o trabalho de integração que costuma
esconder os bugs mais caros.

**SQLite em arquivo local como "banco de desenvolvimento".** Daria persistência real
sem depender de rede, e o Prisma suporta o provider nativamente. Descartado por dois
motivos: primeiro, ainda seria preciso trocar o `datasource provider` do schema entre
ambientes (SQLite não fala todo dialeto que o Postgres fala, e o schema já usa `Json`
como tipo de coluna — suportado de forma diferente entre os dois); segundo, e mais
importante para o objetivo didático, SQLite ainda seria "banco" — perderíamos a
demonstração de que a arquitetura tolera uma implementação de infra **sem banco
nenhum**, que é o que realmente prova a inversão de dependência.

**Um único repositório com um branch `if (hasDatabase)` dentro de cada método**, em vez
de duas classes separadas. Menos arquivos. Descartado porque misturaria duas
implementações dentro do mesmo objeto, contrariando o próprio ponto do padrão
Strategy/Repository que o ADR-0002 já usa: a implementação inteira deveria ser
substituível, não ramificada por dentro. Duas classes tornam a fronteira entre "modo
Postgres" e "modo memória" visualmente óbvia — dois arquivos, dois nomes — em vez de
espalhada em condicionais.

**Testes de paridade automatizados entre as duas implementações, desde já.** Seria a
forma correta de eliminar o risco de divergência descrito nas Consequências.
Descartado como parte deste ADR — não porque seja ruim, mas porque é escopo de teste,
não de arquitetura, e o `ARQUITETURA.md` §8 marca testes unitários de use case como
"opcionais" para o MVP. Fica registrado aqui como a mitigação certa se o projeto tiver
tempo de mentoria sobrando.
