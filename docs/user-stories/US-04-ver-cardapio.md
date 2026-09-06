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

## [DECISÃO PENDENTE]

- **Identificador na URL.** O handoff usa `/restaurante/:slug`; o
  `ARQUITETURA.md` §3.1 usa `/restaurante/[id]`. O ERD já registra essa
  pendência para ADR. Escolher um e registrar.
- **Seções sem prato.** A navegação lateral do design lista seis seções
  ("Salgados", "Doces", "Bebidas") que não têm itens no mock. Definir se seção
  vazia aparece ou é escondida.
