# ADR-0016: Bug conhecido do Next.js 15.5.25 — `notFound()` devolve HTTP 200 sob `next start`

- **Status:** Accepted
- **Data:** 2026-09-06

## Contexto

O `frontend-agent` isolou um defeito na versão do Next.js instalada
(`apps/web/package.json`, `"next": "^15.5.25"`): chamar `notFound()` num Server
Component renderiza corretamente o conteúdo do `not-found.tsx` da rota (o HTML que a
pessoa vê está certo), mas a resposta HTTP, sob `next start` (build de produção), sai
com **status 200** em vez de **404**. O `frontend-agent` reproduziu isso com uma rota
mínima, sem nenhum `fetch` nem lógica própria — ou seja, não é um erro de uso das APIs
do App Router (`notFound()`, `not-found.tsx`, `app/*/not-found.tsx` por segmento), é um
defeito da própria versão do framework.

Isso afeta diretamente três rotas que dependem de `notFound()` neste projeto:
`/restaurante/[slug]/not-found.tsx` e `/pedido/[codigo]/not-found.tsx` (ambas chamadas
quando a API devolve 404) e `not-found.tsx` na raiz. O conteúdo visual está correto nas
três — a pessoa vê a mensagem certa. O que sai errado é só o código de status HTTP da
resposta.

Isso importa por uma razão específica deste projeto: o ADR-0003 justifica Next.js com
App Router, entre outras coisas, pela necessidade de SEO real nas páginas de
restaurante — "o handoff é explícito ao dizer que espera SSR/SSG para SEO das páginas
de restaurante". Status HTTP incorreto em página inexistente é exatamente o tipo de
coisa que prejudica indexação de verdade (um crawler que recebe 200 para uma URL que
deveria ser 404 pode indexar a página como conteúdo válido, ou penalizar o domínio por
"soft 404"). Também afeta qualquer monitoramento externo de disponibilidade que dependa
de código de status.

Ao mesmo tempo, é um bug de terceiros, não do código do time, descoberto muito perto da
entrega da release 0.1.0 — e o produto é um demo educacional sem tráfego de busca real
nem monitoramento de uptime em produção.

## Decisão

**Aceitar como risco conhecido para a release 0.1.0.** Não fazemos bump nem downgrade
de versão do Next.js sob a pressão de prazo desta release para perseguir uma correção
não verificada.

Concretamente:

- O comportamento visual (conteúdo do `not-found.tsx`) está correto e é o que a
  verificação end-to-end do `ARQUITETURA.md` §10 observa — a release não é bloqueada
  por isso.
- O código de status incorreto (200 em vez de 404) fica registrado aqui como defeito
  conhecido de dependência, não como bug do time.
- Fica como ação de acompanhamento, **fora da janela desta release**: verificar o
  changelog do Next.js por uma versão de patch que corrija especificamente
  `notFound()`/status HTTP sob `next start`, testar o bump isoladamente (branch própria,
  sem pressão de prazo), e só then atualizar `apps/web/package.json`.
- Se o produto algum dia precisar de SEO real (fora do escopo desta release, que é
  material de mentoria), este ADR precisa ser revisitado antes de contar com a
  indexação correta das páginas de restaurante.

## Consequências

A release 0.1.0 sai sem depender de uma atualização de dependência não testada às
vésperas da entrega — o tipo de mudança que mais frequentemente introduz regressão de
última hora. O comportamento que a mentoria demonstra (fluxo completo, telas de erro
corretas) continua intacto.

Custos assumidos, sem eufemismo:

- **Um crawler de busca real trataria as URLs inexistentes como conteúdo válido.** Para
  este projeto (demo educacional, sem domínio público indexado em produção real) isso
  não tem efeito prático hoje — mas é exatamente o tipo de defeito que passaria
  despercebido até doer, se este código virasse a base de um produto real sem que
  alguém revisitasse este ADR antes.
- **Qualquer monitoramento de uptime que dependa de status HTTP** (ex.: um health check
  externo apontando para uma URL de restaurante inexistente) reportaria "no ar" mesmo
  quando o recurso não existe. Não há esse monitoramento configurado nesta release
  (`ARQUITETURA.md` §11 já tira observabilidade de escopo), então o custo é hipotético
  por ora.
- **Ninguém no time corrige isso por conta própria "só pra garantir"** — a decisão
  explícita é não mexer na versão do Next.js sob pressão de prazo. Isso significa aceitar
  o defeito por, no mínimo, o tempo até a próxima janela de manutenção.
- **O defeito é silencioso**: não aparece em `tsc --noEmit`, não aparece em `next build`,
  e só se manifesta sob `next start` (produção), não sob `next dev`. Quem só rodar
  `npm run dev` localmente nunca vai ver o sintoma — o `frontend-agent` só achou porque
  testou o build de produção antes de reportar "pronto", que é exatamente a disciplina
  que `docs/qa/00-briefing-do-lead.md` (seção E) já pedia ("`npm run build` verde").

## Alternativas consideradas

**Atualizar o Next.js para a última versão disponível agora, sob a pressão desta
release.** Resolveria o problema se a versão nova corrigir o defeito — mas sem
verificação isolada previa, essa é uma aposta: majors/minors de framework trazem
mudanças de comportamento (o próprio App Router já teve breaking changes entre
versões), e trocar dependência crítica sem tempo de regressão completa às vésperas da
entrega é o tipo de risco que este ADR existe justamente para não correr.

**Contornar no código da aplicação** — por exemplo, um middleware que force status 404
manualmente quando a rota cair no `not-found.tsx`. Descartado por ser gambiarra que
esconde um defeito de framework atrás de lógica de aplicação: exigiria detectar, de
dentro do middleware, que aquela resposta especificamente veio de um `notFound()`, o
que o Next.js não expõe de forma direta e estável entre versões — o tipo de código
frágil e "esperto demais" que `ARQUITETURA.md` pede para evitar.

**Trocar de `notFound()`/`not-found.tsx` por checagem manual de existência e
`redirect()` para uma página de erro genérica com status setado à mão.** Contornaria o
bug substituindo o mecanismo nativo do App Router por um mais verboso e sob controle
total do time. Descartado porque joga fora, sem necessidade, a API nativa do framework
que o ADR-0003 escolheu justamente por reduzir código próprio — trocar por causa de um
bug pontual, perto da entrega, é desproporcional ao problema.

**Não registrar nada e deixar como está, sem ADR.** Mais rápido agora. Descartado
porque é precisamente o tipo de defeito que "some" da memória do time depois da
release — um bug que não afeta o que se vê na tela é fácil de esquecer, e alguém
revisitando o projeto meses depois (ou preparando uma versão com SEO real) precisa
achar isso documentado, não redescobrir investigando do zero.
