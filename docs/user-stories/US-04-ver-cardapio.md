# US-04: Ver cardápio

**Como** cliente, **quero** ver o cardápio de um restaurante com seções e fotos, **para** escolher um item.

- Referência visual: `03 · Cardápio do restaurante`
- Estados envolvidos: carregando, populado, restaurante aberto vs. fechado (a variante fechada é a US-09), item indisponível (US-09), sacola vazia vs. com itens no trilho lateral
- Entidades de domínio: `Restaurant`, `MenuSection`, `MenuItem`, `OpeningHour`

## Contexto

A tela abre com a capa do restaurante e a ficha sobreposta: logo, nome, selo
"Aberto agora", nota e contagem de avaliações, tags, endereço e o bloco
"Pronto em ~18 min".

O corpo é de três colunas: navegação das seções à esquerda (fixa, destacando a
seção visível conforme se rola), a lista de pratos no meio e a mini-sacola fixa
à direita, que atualiza em tempo real.

Cada prato mostra nome, descrição, preço, foto e os selos aplicáveis
("Mais pedido da casa", promoção). O botão `+` sobre a foto abre o modal de
customização (US-05).

## O que entra

- Ficha do restaurante com estado de abertura, nota, tags, endereço e tempo de
  preparo.
- Navegação lateral pelas seções do menu, com destaque da seção visível.
- Lista de pratos agrupada por seção, com foto, descrição, preço e selos.
- Mini-sacola lateral: itens, quantidade, subtotal, CTA "Ver sacola" e a nota
  "Retirada no balcão · sem taxa".
- Clique no prato abre o modal e o endereço reflete isso, para poder voltar
  pelo botão do navegador.

## O que NÃO entra

- Customizar e adicionar o item (US-05).
- Editar a sacola aqui — a mini-sacola é só leitura + atalho (US-06).
- Avaliações, comentários ou fotos enviadas por clientes.
- "Ligar" e "Ver mapa" como funcionalidades — só o dado exibido.
- Grade semanal de horários (aparece na variante fechada, US-09).

## Decisões

- **Identificador na URL:** `/restaurante/[slug]` — resolvido no briefing do
  lead (`docs/qa/00-briefing-do-lead.md`, seção A) e ratificado por ADR pelo
  `architect-agent`.
- **Seções sem prato:** ficam ocultas, tanto na navegação lateral quanto no
  corpo do cardápio —
  [DP-08](../decisoes-produto.md#dp-08--seções-de-cardápio-sem-prato-ficam-ocultas).
- **Troca de restaurante com sacola:** se a pessoa tenta abrir o modal de um
  item de outro restaurante com a sacola não vazia, aparece o diálogo de
  confirmação antes do modal de customização —
  [DP-21](../decisoes-produto.md#dp-21--troca-de-restaurante-com-sacola-entra-no-mvp).

## Critérios de aceite

- Acessar `/restaurante/[slug]` mostra a ficha (logo, nome, selo de abertura,
  nota, tags, endereço, tempo de preparo) e o cardápio agrupado por seção.
- Só aparecem, na navegação lateral e no corpo, seções que têm pelo menos um
  prato.
- Rolar a página destaca, na navegação lateral, a seção correspondente ao
  trecho visível (scrollspy).
- A mini-sacola lateral reflete o estado atual da sacola e atualiza sem
  recarregar a página ao adicionar um item.
- Clicar no `+` de um prato de um restaurante diferente do da sacola atual (com
  a sacola não vazia) mostra o diálogo de DP-21 antes de qualquer modal de
  customização abrir.
- Clicar no `+` de um prato abre o modal em `/restaurante/[slug]?item=X`, e o
  botão voltar do navegador fecha o modal sem sair da página.
