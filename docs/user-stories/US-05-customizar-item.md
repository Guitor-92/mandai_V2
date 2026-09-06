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

## [DECISÃO PENDENTE]

- **Opção esgotada.** O ERD tem `ModifierOption.available` ("a opção pode
  esgotar sozinha"), mas nenhuma tela desenha uma opção indisponível dentro do
  modal. Definir o tratamento visual ou remover o campo do MVP.
- **Modificadores como tabela ou JSON.** O ERD registra a alternativa mais
  enxuta (guardar tudo em um campo JSON no prato), ao custo de perder a
  validação no servidor. Vale decidir antes de escrever o schema.
