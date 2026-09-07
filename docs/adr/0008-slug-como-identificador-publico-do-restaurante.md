# ADR-0008: `slug` como identificador público do restaurante

- **Status:** Accepted
- **Data:** 2026-09-06

## Contexto

`docs/erd.md` registrou a pendência sem resolver: o ERD já modela `Restaurant.slug`
como chave única, mas `ARQUITETURA.md` §2.4 e §3.1 falam em `/restaurante/:id` e
`GET /api/restaurants/:id`. O handoff, por sua vez, desenha a URL como
`/restaurante/:slug` em todas as telas que navegam para um restaurante (03, 07, 08) e
o `README.md` do handoff confirma esse padrão. Dois documentos, dois vocabulários, uma
única PK no banco — faltava decidir qual identificador cruza a fronteira HTTP.

A pressão não é só estética. `id` é `cuid()` — uma string opaca, sem significado, gerada
para ser única e imprevisível. Isso é exatamente o que se quer numa PK/FK interna: nunca
muda, nunca colide, nunca carrega significado que possa precisar mudar depois. Mas é
péssimo em URL pública: `/restaurante/ckv3n2j9x0000qzrm5f8t2a1b` não diz nada para quem
olha a barra de endereço, não é compartilhável de cor, e não ajuda em nada de SEO — e
`ARQUITETURA.md` §3 já elege páginas de restaurante Server-Rendered pensando em
indexação.

`slug` (`padaria-do-ze`) resolve os dois problemas ao mesmo tempo: é legível, é
compartilhável, e é o tipo de string que motores de busca associam ao nome do
estabelecimento. O custo de mantê-lo é baixo porque o cardápio é populado por seed
neste MVP — não há tela de cadastro de restaurante que precise gerar e validar slug em
tempo real.

## Decisão

`slug` é o identificador **público**: aparece na URL do frontend e é o parâmetro que a
API espera nos endpoints que operam sobre um restaurante específico. `id` (cuid)
continua existindo, mas fica **confinado à camada de persistência** — é a PK da tabela
`Restaurant` e a FK usada por `MenuSection`, `Order` e qualquer outra tabela que
referencie um restaurante.

Nenhuma rota do frontend e nenhum endpoint da API aceita ou devolve `id` de restaurante.
Onde a resposta HTTP precisa de um identificador de restaurante — por exemplo, o corpo
de `GET /api/restaurants` usado para montar o link de cada card — o campo exposto é
`slug`, não `id`. `id` pode aparecer no JSON como detalhe interno do registro, mas nunca
é o campo que outra chamada usa para navegar ou buscar.

Concretamente:

- Rota do frontend: `/restaurante/[slug]` (ADR-0009 formaliza o mapa completo de rotas).
- Endpoint: `GET /api/restaurants/:slug`, não `GET /api/restaurants/:id`.
- Repositório de domínio: a interface `RestaurantRepository` declara
  `findBySlug(slug: string): Promise<Restaurant | null>` como o método usado pelos
  use cases voltados a HTTP. Um `findById` pode existir se `Order` precisar resolver o
  restaurante internamente a partir da FK salva, mas nenhuma rota o expõe.
- Seed (`prisma/seed-data.ts`): cada restaurante ganha um `slug` derivado do nome,
  kebab-case, sem acento (`Padaria do Zé` → `padaria-do-ze`), único por construção do
  próprio seed.

`ARQUITETURA.md` §2.4, §3.1 e §4.1, onde mencionam `:id`, ficam supersedidos por este
ADR nesse ponto específico — o restante desses parágrafos continua valendo.

## Consequências

A URL do restaurante fica legível e estável o bastante para SEO e para compartilhamento
manual (colar o link no WhatsApp e reconhecer do que se trata). O código do frontend
nunca precisa saber que `id` existe — `useRestaurant(slug)` e
`restaurants.api.ts` trabalham só com `slug` do início ao fim.

Em troca:

- **Dois identificadores para a mesma entidade** é uma fonte concreta de confusão para
  quem está aprendendo: por que o banco usa um e a API usa outro? A resposta ("PK
  interna estável vs. identificador público legível") precisa ser dita em voz alta na
  aula, ou vira "mais uma coisa arbitrária do código".
- **`slug` precisa ser único e o seed é responsável por isso.** Não há verificação de
  colisão em tempo de escrita porque não há tela de cadastro no MVP — se um dia
  restaurantes puderem ser criados dinamicamente, a unicidade de `slug` (já `UK` no
  schema, conforme `docs/erd.md`) precisa de geração com verificação de colisão, hoje
  inexistente.
- **Trocar o nome do restaurante não deveria trocar o slug em produção real** — mudar
  o slug depois de publicado quebra links compartilhados e indexação. O MVP não
  resolve isso (não há edição de restaurante), mas é uma armadilha conhecida para
  quando essa funcionalidade existir.
- **Buscar por `id` continua útil internamente.** `Order.restaurantId` é FK para `id`,
  não para `slug` — é assim que a integridade referencial do banco continua barata e
  imune a uma eventual mudança de `slug` no futuro. Isso reforça por que a decisão é
  "público usa slug, interno usa id", não "elimine `id`".

## Alternativas consideradas

**Usar só `id` em toda parte, como o plano original propunha.** Mais simples — um único
identificador, sem a dualidade acima. Descartado porque contraria o handoff (que é a
referência de design, não tocável) e desperdiça a força de SEO que o próprio
`ARQUITETURA.md` §3 reivindica ao escolher Server Components para essas páginas. Um
cuid na URL não é indexável de forma útil.

**Usar só `slug`, inclusive como PK do banco.** Eliminaria a dualidade por completo.
Descartado porque strings legíveis mudam (o restaurante corrige a grafia do próprio
nome) e não deveriam mudar quando isso acontece — uma PK precisa ser estável para
sempre, e uma FK apontando para uma string que pode ser editada é um projeto de dados
frágil. `cuid()` como PK e `slug` como campo único e público é o padrão estabelecido
para esse exato problema.

**Aceitar os dois formatos no mesmo parâmetro de rota** (`/api/restaurants/:idOrSlug`,
detectando se é cuid ou slug em tempo de execução). Pareceria mais flexível. Descartado
por ser ambiguidade desnecessária: dois formatos válidos para o mesmo parâmetro é mais
código de validação, mais superfície de bug, e nenhum ganho — nada no produto precisa
que a API aceite `id` de fora.
