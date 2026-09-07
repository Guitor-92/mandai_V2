# ADR-0012: Piso de acessibilidade

- **Status:** Accepted
- **Data:** 2026-09-06

## Contexto

`ARQUITETURA.md` §11 lista "i18n, dark mode, acessibilidade WCAG" fora do escopo do
MVP, na mesma frase, como se as três fossem do mesmo tamanho de esforço. Não são. i18n
e dark mode são features que o produto genuinamente não pede — não há segunda língua,
não há tema alternativo desenhado. Acessibilidade é diferente: o próprio handoff, que é
a referência de design não tocável, já embute comportamento acessível em pontos
específicos, sem que isso apareça como uma "feature" separada:

- O modal de adicionar item (tela 04) é um padrão de overlay clássico, e overlay sem
  foco preso é uma armadilha de teclado conhecida — quem navega por Tab escapa do modal
  para o conteúdo atrás dele, que deveria estar inerte.
- `README.md` do handoff e as anotações das telas mencionam Esc para fechar modal/
  overlay como interação esperada, não como extra.
- A tela `06 · Pedido confirmado` tem um QR code que é, por natureza, informação
  puramente visual — sem texto alternativo, ela é invisível para leitor de tela, e o
  código `MA-XXXX` (que é a *mesma informação* do QR, em texto) já está na mesma tela.
- Todo formulário do fluxo (nome no checkout, campo de busca, campo de cupom) é curto e
  já tem, no design, um texto de rótulo visível ao lado do campo — não é um formulário
  "flutuante" sem label nenhum.

Tratar essas coisas como "acessibilidade WCAG, fora de escopo" junto com i18n e
dark mode seria descartar comportamento que o próprio design já pede, por associação
com um assunto muito maior (conformidade WCAG completa, que de fato está fora de
escopo). A pergunta que faltava responder não era "fazemos acessibilidade?", era
"onde exatamente a linha corta".

Este ADR é escrito em coordenação com o `product-owner-agent`, que registrou
[DP-26](../decisoes-produto.md#dp-26--piso-mínimo-de-acessibilidade) em
`docs/decisoes-produto.md` com a mesma pergunta em aberto. As duas decisões convergem;
este ADR formaliza DP-26 do lado técnico-arquitetural (por que este é o piso certo,
quais os custos assumidos) e fecha um detalhe que DP-26 deixa explícito e que a
primeira leitura do briefing do lead não cobria por completo: `aria-label` também em
botão *icon-only* (fechar modal, lixeira da sacola, copiar código), não só no QR.

## Decisão

O piso de acessibilidade do MVP é **o que já é inerente a implementar a funcionalidade
direito** — não uma auditoria de acessibilidade em cima do produto pronto. Concretamente:

1. **Foco preso (focus trap) e `Esc` no modal de customização** (tela 04) e em
   qualquer outro overlay do produto. Enquanto o overlay está aberto, `Tab`/`Shift+Tab`
   circulam só entre os elementos focáveis dentro dele; `Esc` fecha; o elemento que
   abriu o overlay recebe o foco de volta ao fechar. Isso **não é tratado como extra de
   acessibilidade** — é requisito funcional da própria US-05 (o modal de customização
   precisa se comportar como modal), que só coincide em ser também o item de
   acessibilidade mais barato de esquecer.
2. **`<label>` associado a todo campo de formulário** — nome no checkout, cupom, busca,
   observação do item. Via `<label htmlFor>` quando o design já mostra um rótulo
   visível, ou `aria-label` quando o rótulo visível não existe por decisão de design.
   Nenhum `<input>` sem nome acessível.
3. **`aria-label` em todo botão *icon-only*** — fechar modal, lixeira de item na
   sacola, copiar código do pedido. Um botão que só tem ícone, sem texto visível, sem
   nome acessível é uma armadilha idêntica em espírito à do campo de formulário sem
   rótulo — e do mesmo jeito, barata de evitar.
4. **`aria-label` descritivo no QR code** da tela `06 · Pedido confirmado` (por
   exemplo, `aria-label="QR code do pedido MA-7K2D"`), com o código em texto ao lado
   como alternativa. Também não é extra: US-08 já exige o código em texto por si só
   (para ser lido em voz alta no balcão), o `aria-label` só nomeia a imagem que duplica
   essa mesma informação.
5. **Outline de foco visível, preservado.** `tokens.css` já define um outline de foco
   (handoff, `design_handoff_mandai_web`); a decisão aqui é não removê-lo em nenhum
   componente — nunca um `outline: none` sem substituto visível equivalente.

Isso é o piso — **não** uma auditoria WCAG. Ficam **fora** deste ADR, deliberadamente:

- Conformidade formal com WCAG 2.1 em qualquer nível (A, AA, AAA).
- Auditoria de contraste de cor (`tokens.css` é reutilizado como está, conforme regra
  do design system em `CLAUDE.md`; não há revisão de contraste adicional).
- Testes automatizados de acessibilidade (`jest-axe`, `@testing-library` com regras de
  a11y, Lighthouse CI).
- Navegação completa por leitor de tela testada manualmente (NVDA, VoiceOver) ou 100%
  por teclado testada ponta a ponta.
- `role="spinbutton"` no seletor de quantidade — um `<input type="number">` nativo com
  os botões +/- ao lado já é acessível o bastante, sem o vocabulário extra de ARIA.
- Skip links, landmarks ARIA completos (`role="navigation"`, `role="main"` etc.) além
  do HTML semântico que os componentes já produzem naturalmente (`<nav>`, `<main>`,
  `<button>` em vez de `<div onClick>`).
- Suporte a `prefers-reduced-motion` ou a zoom de página além do que o navegador já
  oferece de graça.

Implementação sugerida para o item 1: um hook compartilhado `useFocusTrap` (ou
biblioteca leve equivalente, se já fizer parte do restante do stack) em
`apps/web/src/shared/`, usado tanto pelo modal de item quanto por qualquer outro
overlay futuro — em vez de reimplementar foco preso e `Esc` em cada componente.

## Consequências

O produto sai do MVP sem a armadilha de teclado mais comum de overlay (foco escapando
para trás do scrim) e sem o ponto de acessibilidade mais barato de esquecer (imagem sem
alternativa textual, quando o texto equivalente já existe na mesma tela) — os dois
comportamentos que o próprio handoff já sugeria sem nomear como "acessibilidade".

Isso é pouco código: um hook de foco preso reutilizado, um punhado de atributos
`aria-label` nos botões icon-only e no QR, e `<label>`/`aria-label` em quatro ou cinco
campos de formulário no total do produto. O custo de implementação é baixo o
suficiente para não competir de verdade com o tempo dedicado aos conceitos-âncora da
mentoria.

Custos e limites assumidos, sem eufemismo:

- **Isto não é um produto acessível.** Não há teste com leitor de tela real, não há
  garantia de contraste, não há revisão de ordem de leitura, não há tratamento de
  `prefers-reduced-motion`. Chamar o piso de "acessibilidade" sem qualificar seria
  enganoso — por isso o nome do ADR é "piso", não "suporte a acessibilidade".
- **Nenhum teste automatizado impede regressão.** Se alguém remover o `aria-label` do
  QR num refactor futuro, nada quebra e nada avisa — só uma leitura de código pega.
- **O piso foi escolhido por ser o que o handoff já implica, não por um critério
  normativo (WCAG).** Isso significa que ele pode ser insuficiente para qualquer
  requisito legal real (a Lei Brasileira de Inclusão, por exemplo, tem exigências que
  vão além disso). Para um demo educacional isso é aceitável; para um produto real,
  não seria.
- **Desktop-only (`ARQUITETURA.md`, escopo do produto) já exclui, por decisão de
  produto anterior a este ADR, qualquer pessoa que dependa de zoom de tela em
  dispositivo móvel** — este ADR não resolve isso porque é escopo de outra decisão
  (ausência de responsividade), não de acessibilidade.

## Alternativas consideradas

**Seguir `ARQUITETURA.md` §11 ao pé da letra: zero acessibilidade no MVP.** Mais barato
ainda, zero código extra. Descartado porque descartaria comportamento que o próprio
handoff (a referência de design, não tocável) já pede explicitamente para o modal —
foco preso e Esc não são invenção deste ADR, são leitura literal do protótipo. Ignorar
isso seria divergir do handoff, não simplificar o escopo.

**Conformidade WCAG 2.1 nível AA completa.** Seria o padrão de mercado para um produto
real e o critério mais defensável em uma auditoria. Descartado explicitamente por
`ARQUITETURA.md` §11 e por ser desproporcional ao objetivo didático: cobriria
contraste, ordem de leitura, skip links, `prefers-reduced-motion`, compatibilidade com
leitor de tela ponta a ponta — cada um desses é um assunto de aula por si só, e nenhum
deles é conceito-âncora da mentoria (que são inversão de dependência, use cases, Server
vs. Client Components).

**Testes automatizados de acessibilidade (`jest-axe`) desde já.** Pegaria regressões
sem esforço manual contínuo. Descartado para o MVP pelo mesmo motivo que testes
unitários de use case ficaram opcionais no `ARQUITETURA.md` §8 — é investimento de
tempo de teste, não de arquitetura, e a base de testes do projeto ainda não existe.
Fica registrado como extensão natural, junto com os testes de paridade do ADR-0011, se
sobrar tempo de mentoria.

**Deixar a decisão só em `docs/decisoes-produto.md` (DP-26), sem ADR técnico.**
Evitaria a aparente duplicação entre os dois documentos. Descartado porque as duas
fontes respondem perguntas diferentes: DP-26 é a decisão de produto ("o que a tela
precisa fazer"), este ADR é o registro arquitetural do porquê esse piso é o certo e do
custo assumido em não ir além — o tipo de raciocínio que `docs/adr/` existe para
preservar (ADR-0007) e que um documento de decisões de produto não é o lugar de
carregar.
