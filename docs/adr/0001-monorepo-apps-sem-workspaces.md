# ADR-0001: Monorepo com pastas `apps/*` sem workspaces

- **Status:** Accepted
- **Data:** 2026-09-06

## Contexto

O Mandaí tem dois artefatos executáveis: um frontend Next.js e um backend Fastify.
Eles compartilham o mesmo repositório, o mesmo handoff de design e a mesma
documentação em `docs/`. Manter os dois juntos é óbvio; a pergunta é *como* juntar.

O projeto é material de mentoria para um público com conhecimento básico em tech.
Isso muda o critério de decisão: a ferramenta certa não é a mais ergonômica para um
time sênior, é a que gera menos conceitos novos antes do primeiro `npm run dev`.
Workspaces trazem `package.json` raiz, hoisting de `node_modules`, resolução de
dependências entre pacotes e um vocabulário próprio (`--workspace`, `-w`) — tudo isso
antes de o aluno ver uma única linha de domínio.

Há também uma força vinda do deploy: a Vercel trata cada projeto como uma pasta raiz
independente (`Root Directory`). Dois projetos Vercel apontando para o mesmo repo é o
caminho natural, e ele já pressupõe que cada `apps/*` se instala e builda sozinho.

## Decisão

Não existe `package.json` na raiz e não usamos workspaces.

`apps/web` e `apps/api` são projetos npm **independentes**, cada um com seu
`package.json`, seu `package-lock.json` e seu `node_modules`.

O fluxo do aluno é sempre o mesmo: entrar na pasta, `npm install`, `npm run dev`.

A raiz guarda apenas o que não é código executável: `README.md`, `.gitignore`,
`.nvmrc` (Node 20 LTS), `docs/` e `design_handoff_mandai_web/`.

Cada app tem seu projeto na Vercel, com `Root Directory` apontando para a própria
pasta.

## Consequências

O onboarding fica trivial e o modelo mental é honesto: duas aplicações, dois deploys,
dois ciclos de vida. O que o aluno faz na máquina é exatamente o que a Vercel faz no
build.

Em troca, aceitamos custos reais:

- **Duplicação de dependências.** `typescript`, `zod` e `@types/node` são instalados
  duas vezes, em versões que podem divergir. Não há hoisting para nos salvar.
- **Sem pacote compartilhado.** Os tipos do contrato HTTP (`Restaurant`, `Order`)
  serão escritos duas vezes — uma em `apps/api/src/modules/ordering/domain`, outra em
  `apps/web/src/shared/types.ts`. Divergência entre eles é um bug esperado, não uma
  surpresa. É o preço que pagamos por não ter `packages/shared`.
- **Sem comando único.** Não há `npm run dev` na raiz que suba os dois. São dois
  terminais.
- **Sem build orquestrado.** Nada de cache incremental ou grafo de tarefas. Em um
  projeto deste tamanho isso não dói; em um projeto real, doeria.

Se o projeto crescer para além do demo, a migração para workspaces é mecânica:
adicionar um `package.json` raiz com o campo `workspaces` e extrair os tipos
compartilhados. Nada nesta decisão impede isso — e essa migração é, ela própria, um
bom exercício de mentoria.

## Alternativas consideradas

**npm workspaces.** Resolveria a duplicação de dependências e habilitaria um
`packages/shared` com os tipos do contrato. Descartado porque introduz conceitos
(hoisting, resolução de symlink, `--workspace`) que precisam ser explicados antes do
primeiro `dev` — e porque a Vercel exige configuração extra de `Install Command` e
`Root Directory` para lidar com o lockfile da raiz. Custo de explicação alto, ganho
invisível num repo de dois apps.

**Turborepo.** Traz cache de build, grafo de tarefas e um `dev` único na raiz. Tudo
isso paga quando há muitos pacotes e um CI caro. Aqui há dois apps e o CI é o deploy
automático da Vercel. Descartado por ser ferramenta sem problema correspondente — o
aluno aprenderia `turbo.json` em vez de arquitetura.

**Dois repositórios separados.** Elimina qualquer ambiguidade sobre fronteiras. Foi
descartado porque quebraria a coesão da mentoria: o handoff de design, os ADRs, o ERD
e as user stories são de *um* produto, e mudanças de contrato entre web e api
precisariam de dois PRs coordenados para serem revisadas juntas.

**Backend dentro do Next.js (Route Handlers).** Seria um único app e um único deploy.
Descartado porque o objetivo didático central é mostrar camadas de backend
separadas — domínio, use cases, infra, HTTP. Enfiar isso dentro de `app/api/` embaraça
a fronteira que estamos justamente tentando ensinar a enxergar.
