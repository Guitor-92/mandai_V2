# US-05: Customizar item

**Como** cliente, **quero** escolher acompanhamentos, adicionais e adicionar observações ao pedir, **para** personalizar.

- Referência visual: `04 · Adicionar item (modal)`
- Estados envolvidos: abrindo (fade + slide-up), CTA bloqueado enquanto falta escolha obrigatória, CTA liberado, contador de caracteres da observação, item esgotado (US-09)
- Entidades de domínio: `MenuItem`, `ModifierGroup`, `ModifierOption`

## Contexto

O modal é onde o prato vira uma linha de pedido. Ele mostra a foto grande, o
nome, a descrição e o preço base, e abaixo os grupos de escolha.

O design traz dois grupos com comportamentos diferentes:
"Escolha o acompanhamento" é **obrigatório** e de escolha única (mel da casa,
geleia de pimenta, doce de leite — todos grátis), enquanto "Adicionais" é
**opcional** e de escolha livre (queijo coalho extra, manteiga da terra, carne
de sol, coco ralado), cada um somando ao total.

No pé ficam a observação livre ("Algum recado pro restaurante?", limite de 140
caracteres, com contador), o seletor de quantidade (1 a 20) e o CTA
"Adicionar à sacola" com o total já recalculado.

No modelo, `minSelect`/`maxSelect` do `ModifierGroup` é o que define
obrigatoriedade e se a opção vira escolha única ou múltipla — o mesmo
vocabulário cobre os dois grupos do design.

## O que entra

- Abrir o modal a partir do card do prato, com endereço próprio para deep-link
  e botão voltar.
- Renderizar os grupos de modificadores conforme suas regras de mínimo e máximo.
- Bloquear a adição enquanto um grupo obrigatório não estiver resolvido.
- Somar as diferenças de preço das opções ao total, ao vivo.
- Campo de observação com limite de 140 caracteres e contador.
- Seletor de quantidade de 1 a 20.
- Adicionar à sacola e fechar (por backdrop, Esc ou X), devolvendo o foco.
- Revalidar as regras dos grupos no servidor ao fechar o pedido — nunca confiar
  no que o navegador afirma ter escolhido.

## O que NÃO entra

- Editar um item já na sacola (US-06 reabre este mesmo modal pré-populado).
- Escolher a mesma opção mais de uma vez (não há quantidade por modificador).
- Preço de modificador variando por quantidade do prato.
- Salvar uma customização como favorita.

## Decisões

- **Opção esgotada:** some da lista de escolhas do modal, sem badge — e o
  servidor rejeita se o cliente enviar uma opção indisponível mesmo assim —
  [DP-09](../decisoes-produto.md#dp-09--opção-de-modificador-esgotada).
- **Modificadores como tabela ou JSON:** continuam como tabelas
  (`ModifierGroup`/`ModifierOption`) —
  [DP-10](../decisoes-produto.md#dp-10--modificadores-continuam-como-tabelas).
- **Observação do item:** campo opcional, até 140 caracteres, placeholder
  "Algum recado pro restaurante? (opcional)" e contador `0/140` —
  [DP-25](../decisoes-produto.md#dp-25--observação-do-item-opcional-140-caracteres).
- **Acessibilidade do modal:** foco preso e Esc fazem parte do requisito
  funcional desta história, não são extra —
  [DP-26](../decisoes-produto.md#dp-26--piso-mínimo-de-acessibilidade).

## Critérios de aceite

- Abrir o modal a partir do `+` de um prato mostra foto, nome, descrição,
  preço base e os grupos de modificadores daquele prato.
- Um grupo com `minSelect >= 1` bloqueia o CTA "Adicionar à sacola" até que a
  quantidade mínima de opções esteja escolhida.
- Escolher ou remover uma opção atualiza o total exibido no CTA
  imediatamente, somando os `priceDelta` das opções escolhidas × a
  quantidade.
- Uma opção com `available: false` não aparece na lista — mesmo que a pessoa
  tente enviar o pedido com ela via chamada direta à API, o servidor rejeita.
- Digitar mais de 140 caracteres na observação não é possível — o campo trava
  e o contador mostra `140/140`.
- O seletor de quantidade aceita de 1 a 20, com os botões +/- e o input
  nativo.
- Fechar o modal por backdrop, Esc ou X devolve o foco pro elemento que abriu
  o modal; enquanto aberto, o Tab não sai do modal (foco preso).
- Confirmar "Adicionar à sacola" revalida no servidor as regras dos grupos —
  a chamada falha com erro claro se alguma regra de mínimo/máximo não for
  respeitada, mesmo que a UI já tivesse liberado o botão.
