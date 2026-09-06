# US-08: Finalizar e receber código

**Como** cliente, **quero** confirmar o pedido e receber um código `MA-XXXX` + QR, **para** apresentar no balcão.

- Referência visual: `06 · Pedido confirmado` (rotulado `06 · Finalização` no arquivo do design), nos dois estados: formulário de nome e pedido confirmado
- Estados envolvidos: formulário (nome em branco / preenchido), enviando, confirmado, erro no envio (US-09)
- Entidades de domínio: `Order`, `OrderItem`, `Restaurant`, `MenuItem`, `Coupon`

## Contexto

O checkout do Mandaí é curto de propósito: sem cadastro, sem endereço, sem
pagamento. A tela `06` tem dois momentos.

**Formulário** — um campo só, "Seu nome" (com foco automático), o total ao lado
e o botão "Confirmar pedido". O nome é o único dado pessoal coletado, e serve
para chamar a pessoa no balcão.

**Confirmado** — "Pedido confirmado", o QR code em moldura branca, o código
alfanumérico grande e copiável (`MA-7K2D`), os botões "Copiar código",
"Baixar QR" e compartilhar por WhatsApp, o tempo previsto ("Pronto em ~18 min"),
a ficha do restaurante com endereço e telefone, o recibo do que foi pedido
(subtotal, cupom, taxa de retirada grátis, "Total a pagar no balcão") e o
passo a passo da retirada em quatro etapas.

O código é gerado pelo servidor no formato `MA-XXXX`, em maiúsculas e sem
caracteres ambíguos (nada de 0/O, 1/I), e o conteúdo do QR é uma URL assinada
que o atendente lê no balcão.

Um pedido é um **fato histórico**: cada linha copia nome, preço unitário e
modificadores no instante da confirmação. Se o restaurante reajustar o preço na
terça, o pedido de segunda continua mostrando o que a pessoa pagou.

## O que entra

- Formulário de nome com foco automático e validação de campo obrigatório.
- Criar o pedido no servidor a partir da sacola, revalidando itens, preços e
  regras dos grupos de modificadores.
- Gerar código `MA-XXXX` único e o conteúdo assinado do QR.
- Congelar nome, preço e modificadores em cada linha do pedido.
- Calcular subtotal, desconto e total (retirada sempre grátis).
- Página do pedido confirmado, acessível por endereço próprio.
- QR de verdade renderizado a partir do dado do servidor, com o código em texto
  como alternativa acessível.
- Copiar código, baixar o QR como imagem e compartilhar por WhatsApp.
- Esvaziar a sacola depois da confirmação.

## O que NÃO entra

- Pagamento — é no balcão, direto com o restaurante.
- Acompanhamento do pedido em tempo real ("saiu do forno", "pronto") — não há
  tela para isso.
- Cancelar ou alterar pedido já confirmado.
- E-mail ou SMS de confirmação.
- Leitor do QR pelo lado do atendente — é outro produto.
- Agendar horário de retirada.

## [DECISÃO PENDENTE]

- **Rota e chave de leitura.** O handoff usa `/pedido/:codigo` e
  `GET /api/orders/:code`; o `ARQUITETURA.md` usa
  `/confirmacao/[orderId]` e `GET /api/orders/:id`. Escolher um — e notar que
  expor o código na URL é o que faz o link do QR funcionar.
- **Estados de `Order.status`.** `PLACED | READY | PICKED_UP | CANCELED` é
  proposta do ERD, não requisito: o design só desenha o pedido confirmado e não
  há tela que mude status. Definir se o MVP nasce com um estado só.
- **Assinatura do QR.** O formato `mandai.app/r/MA-7K2D?sig=…` implica uma
  chave secreta e uma rota de verificação que ninguém especificou ainda.
