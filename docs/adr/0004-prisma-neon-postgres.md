# ADR-0004: Prisma + Neon Postgres

- **Status:** Accepted
- **Data:** 2026-09-06

## Contexto

O modelo de dados do Mandaí (`docs/erd.md`) é relacional de forma óbvia: restaurante
tem seções, seção tem pratos, prato tem grupos de modificadores, pedido tem linhas.
São relacionamentos 1-N encadeados, com integridade referencial importando de verdade —
um `OrderItem` órfão é um bug de negócio, não um detalhe.

Ao mesmo tempo, a API roda como função serverless na Vercel (ADR-0002). Isso elimina
qualquer banco que dependa de um pool de conexões de longa duração mantido pela
aplicação: cada invocação pode ser um processo novo, e um Postgres tradicional esgota
`max_connections` rapidamente nesse regime.

Há também uma força didática forte. A camada `infra/` do backend existe para mostrar
"interface no domínio, implementação na infra". Para isso funcionar como aula, o
código do repositório precisa ser curto e legível — se a implementação for meia tela de
SQL, a atenção sai da inversão de dependência e vai para a query.

E há a força de operação: ninguém na mentoria vai administrar servidor de banco. O
provisionamento precisa ser gratuito, rápido e integrado ao deploy.

## Decisão

O ORM é **Prisma**; o banco é **Neon Postgres** (free tier).

`apps/api/prisma/schema.prisma` é a fonte da verdade do schema. As migrations são
geradas pelo Prisma e versionadas no repositório.

`prisma/seed.ts` popula 6 a 8 restaurantes e cerca de 30 itens espelhando as categorias
do handoff, com URLs reais do Unsplash. O seed é o que faz `npm run dev` mostrar uma
Home povoada no primeiro minuto.

O `PrismaClient` vive como **singleton** em `src/shared/prisma.ts`, evitando múltiplas
instâncias entre invocações warm da função serverless.

A ligação Neon ↔ Vercel é feita pela **integração de 1 clique**, que popula
`DATABASE_URL` no projeto da API automaticamente. Em desenvolvimento local usamos o
mesmo Neon (ou uma branch de dev do Neon), não um Postgres em Docker.

Valores monetários são sempre **`Int` em centavos** (`priceCents`, `totalCents`,
`priceDelta`). Nunca `Float`, nunca `Decimal`.

`OrderItem.modifiers` é uma coluna **JSON**, não uma tabela — os modificadores
escolhidos só são lidos em bloco, junto da linha do pedido. O racional completo está em
`docs/erd.md`.

## Consequências

O `schema.prisma` é legível o suficiente para ser projetado na tela durante a mentoria
e entendido sem tradução — ele é praticamente o ERD escrito em outra sintaxe. O cliente
gerado dá autocomplete e tipos derivados do schema, o que faz erro de campo virar erro
de compilação.

A implementação dos repositórios fica curta: uma chamada `findMany` com `include`, uma
função `toDomain()` no fim do arquivo, e acabou. Exatamente o tamanho que a aula
precisa.

Neon dá branching de banco, escala a zero e custa nada no free tier. A integração com
a Vercel elimina o passo de copiar connection string.

Os custos:

- **`prisma generate` é uma etapa obrigatória.** Precisa rodar no `postinstall` e no
  build da Vercel. Esquecer disso produz um erro de build confuso, que já é clássico.
- **O cliente gerado é grande.** Em função serverless isso pesa no tamanho do bundle e
  no cold start. Para o volume deste demo é irrelevante; em produção séria, é uma
  conta a fazer.
- **Escala a zero significa cold start do banco também.** A primeira requisição depois
  de um período ocioso paga a retomada do compute do Neon. Numa demo ao vivo, vale
  fazer uma requisição de aquecimento antes de apresentar.
- **Conexões em serverless continuam exigindo atenção.** O singleton do `PrismaClient`
  resolve o caso comum; se o limite de conexões aparecer, a saída é o pooler do Neon
  (PgBouncer) na connection string.
- **Sem banco local.** Depender do Neon significa depender de internet para
  desenvolver. É uma troca consciente: perdemos trabalho offline, ganhamos zero setup
  de Docker.
- **JSON em `modifiers` não é consultável de forma barata.** Se um dia alguém quiser
  "quantas vezes pediram queijo coalho extra", essa query será desconfortável. A
  decisão assume que esse relatório não existe no MVP.
- **A regra de manutenção do ERD passa a valer.** Todo commit que altera
  `schema.prisma` altera `docs/erd.md` junto (ADR-0007). Se isso relaxar, o ERD vira
  mentira documentada.

## Alternativas consideradas

**Drizzle ORM.** Bundle menor, mais rápido em cold start, e a query se parece com SQL —
o que é ótimo para quem já sabe SQL. Descartado pelo público: a sintaxe de query
builder exige que o aluno pense em SQL e em TypeScript ao mesmo tempo, enquanto
`prisma.restaurant.findMany({ include: { sections: true } })` se lê quase como
português. O `schema.prisma` também é um artefato didático melhor que schemas
declarados em TypeScript. Além disso, Prisma tem mais material em português e mais
presença nas vagas.

**Supabase.** Traria Postgres + auth + storage + realtime num único produto, e a auth
pronta seria tentadora. Descartado por dois motivos. Primeiro, não precisamos de auth
no MVP (ADR-0006) — pagaríamos por um produto inteiro por um recurso que decidimos não
ter. Segundo, o caminho natural do Supabase é o cliente falar direto com o banco via
`supabase-js`, o que curto-circuitaria toda a camada de use cases e repositórios que o
ADR-0002 existe para ensinar. Usar Supabase só como Postgres burro é possível, mas aí
o Neon integra melhor com a Vercel.

**Vercel Postgres.** Integração ainda mais direta com o deploy. Descartado porque, no
fundo, é Neon com marca da Vercel e com free tier mais restrito — ir direto ao Neon dá
o mesmo resultado com mais controle e branching de banco disponível.

**PlanetScale (MySQL).** Bom em escala e branching. Descartado porque o free tier foi
descontinuado, porque não há foreign keys por padrão (justamente o que queremos mostrar
funcionando) e porque Postgres é o default do ecossistema serverless hoje.

**SQLite local (arquivo no repo).** Zero setup, funciona offline, e o Prisma suporta.
Descartado porque não sobrevive ao deploy: o filesystem de uma função serverless é
efêmero e read-only. Teríamos um banco em dev e outro em produção — a pior das
combinações para um projeto cujo objetivo inclui demonstrar deploy real.

**Postgres em Docker local.** Reproduz produção e funciona offline. Descartado pelo
custo de entrada: instalar Docker, entender `docker-compose`, lidar com portas e
volumes é uma aula inteira antes da primeira linha de domínio.

**SQL puro com `pg` e queries escritas à mão.** Ensinaria SQL de verdade e deixaria a
camada `infra/` totalmente transparente. Descartado porque o gargalo de atenção da
mentoria é arquitetura, não SQL — e porque o mapeamento manual de linhas para entidades
de domínio, com relacionamentos aninhados, produziria muito mais código do que a aula
comporta.
