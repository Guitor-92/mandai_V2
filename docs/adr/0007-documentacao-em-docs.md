# ADR-0007: Documentação em `docs/` (ERD, ADR, User Stories)

- **Status:** Accepted
- **Data:** 2026-09-06

## Contexto

O código responde "o quê" e "como". Ele não responde "por quê". Num projeto de
mentoria, o "por quê" é justamente o conteúdo: por que monorepo sem workspaces, por que
`modifiers` é JSON, por que não há login.

Sem um lugar definido, esse conhecimento se espalha: um pedaço em comentário de código,
outro no README, outro na descrição de um PR, e o resto na memória de quem escreveu.
Seis meses depois ninguém reconstrói o raciocínio — e no contexto de mentoria, quem
chega novo no repositório é sempre alguém que não estava na conversa.

Duas forças específicas deste projeto pesam:

1. **O ERD tende a mentir.** Ele espelha `schema.prisma`, mas nada obriga os dois a
   andarem juntos. Documento de modelo desatualizado é pior que documento ausente,
   porque é confiável até o momento em que engana.
2. **Decisões arquiteturais são história, não estado.** Saber que hoje não há auth vale
   pouco; saber que auth foi conscientemente adiada e por qual raciocínio vale muito —
   inclusive para decidir quando revisitar.

O `ARQUITETURA.md` na raiz continua existindo, mas ele é o **plano** — um documento
único, escrito de uma vez, que descreve a estrutura pretendida. Não é o lugar de
registrar decisões que mudam ao longo do tempo.

## Decisão

Toda documentação de produto e arquitetura vive em **`docs/`**, na raiz do repositório.
Markdown puro, versionado junto com o código, renderizando nativamente no GitHub.

Três artefatos, cada um com um papel distinto:

**`docs/erd.md`** — o modelo de dados em Mermaid (`erDiagram`), com a prosa que explica
as decisões de modelagem. Espelha `schema.prisma`, mas é documento de domínio
independente: é aqui que a discussão acontece **antes** de mexer no schema.

**`docs/adr/NNNN-slug.md`** — um arquivo por decisão arquitetural, formato Michael
Nygard (Contexto / Decisão / Consequências / Alternativas consideradas). Numeração de
4 dígitos, slug em kebab-case.

**`docs/user-stories/US-NN-slug.md`** — um arquivo por história, formato "Como X, quero
Y, para Z", derivadas das telas do handoff, com `README.md` de índice no diretório. Sem
critérios de aceite detalhados e sem estimativa — o objetivo é mapear escopo para a
conversa, não gerenciar backlog.

**`docs/adr/README.md`** carrega o índice de todos os ADRs e o template para novos.

### Regras de manutenção

**1. ERD e schema mudam juntos.** Um PR que altera `apps/api/prisma/schema.prisma`
altera `docs/erd.md` **no mesmo commit**. Não é sugestão: é a única coisa que impede o
ERD de virar ficção. Um PR que muda schema sem tocar o ERD deve ser barrado no review.

**2. ADRs são imutáveis.** Um ADR aceito não é reescrito. Correção de digitação e link
quebrado, sim; mudança de conteúdo, não. Quando uma decisão muda, cria-se um **novo
ADR** e o anterior passa a `Status: Superseded by ADR-NNNN`, com link para o
substituto. O ADR antigo continua no repositório, porque ele é o registro de por que
se pensou daquele jeito na época.

**3. Numeração nunca é reaproveitada.** Um número, uma decisão, para sempre — mesmo que
o ADR seja superado ou deprecado.

**4. O índice é atualizado no mesmo PR** que cria ou supera um ADR.

## Consequências

Existe um endereço único para a pergunta "por que isso é assim". Uma revisão de código
pode responder "está no ADR-0005" em vez de reabrir a discussão, e uma decisão superada
deixa rastro em vez de sumir.

Os ADRs também são o roteiro da mentoria: cada um é um assunto de aula com contexto,
trade-off e alternativas já organizados.

Como tudo é Markdown versionado, o `git log` de `docs/` conta a evolução do raciocínio
do projeto, e o GitHub renderiza Mermaid sem nenhuma ferramenta extra.

Os custos:

- **A regra 1 depende de disciplina humana.** Não há lint, não há hook, não há CI
  verificando. Se o review deixar passar, o ERD desatualiza silenciosamente. Um
  hook de pre-commit resolveria — e é candidato a exercício.
- **Escrever ADR dá trabalho.** Uma decisão de dez minutos pode virar meia hora de
  escrita. O risco real é o oposto do desejado: em vez de documentar demais, parar de
  documentar por preguiça, e aí os ADRs viram um retrato congelado do início do
  projeto.
- **Nem toda decisão merece ADR.** Não há critério objetivo separando "decisão
  arquitetural" de "escolha de implementação". Na dúvida, o teste prático: se alguém
  poderia razoavelmente fazer diferente e a mudança seria cara depois, vira ADR.
- **Imutabilidade custa navegação.** Para saber o estado atual de um assunto, pode ser
  preciso seguir uma cadeia de `Superseded by`. O índice do `README.md` mitiga isso,
  mas não elimina.
- **`ARQUITETURA.md` e os ADRs vão divergir.** O plano foi escrito uma vez; os ADRs
  evoluem. Quando houver conflito, **o ADR mais recente vence** — o plano é o ponto de
  partida histórico, não a autoridade corrente.

## Alternativas consideradas

**Tudo num único `README.md` na raiz.** Um arquivo só, nada para procurar. Descartado
porque um README que carrega instalação, arquitetura, modelo de dados e histórico de
decisões deixa de ser lido por completo — e, sobretudo, porque um arquivo editado
continuamente não preserva o raciocínio antigo. `git blame` num README de mil linhas
não é histórico de decisão.

**Wiki do GitHub.** Edição fácil, sem PR. Descartado exatamente por isso: a wiki vive
em outro repositório git, não passa por code review, e não pode ser alterada no mesmo
commit que muda o código. A regra "schema e ERD mudam juntos" seria impossível de
aplicar.

**Notion / Confluence.** Melhor experiência de escrita e busca. Descartado porque
exige conta e ferramenta externa, não versiona junto com o código, e some quando o
repositório é clonado. Um projeto de mentoria precisa ser autocontido: `git clone` tem
que trazer o "porquê" junto.

**ADRs como issues ou discussions do GitHub.** Aproximaria a decisão da conversa que a
gerou. Descartado porque issue é fórum de discussão aberta, e ADR é decisão fechada —
misturar os dois deixa ambíguo se algo foi decidido ou apenas proposto. Fora que
issues não sobrevivem a uma migração de plataforma.

**ADRs editáveis, atualizados no lugar quando a decisão muda.** Menos arquivos e
sempre "a verdade atual". Descartado porque destrói o único valor que o ADR tem sobre
qualquer outra documentação: preservar o contexto da época. Saber *por que* se decidiu
errado é mais útil, depois, do que ler a decisão corrigida sem explicação.

**Adotar `adr-tools` (CLI) para gerar e numerar os arquivos.** Automatizaria numeração,
template e marcação de `Superseded`. Descartado para o MVP por ser mais uma ferramenta
a instalar para um volume de sete arquivos — mas é uma adição sensata se o número de
ADRs crescer.

**Formato MADR em vez de Nygard.** Mais estruturado, com critérios de decisão
explícitos e prós/contras por opção. Descartado por ser mais cerimonioso do que este
projeto comporta; o formato Nygard, com quatro seções, é o que se lê inteiro sem
esforço.
