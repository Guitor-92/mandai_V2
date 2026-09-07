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

## Decisões

- **Rota e chave de leitura:** `/pedido/[codigo]` e `GET /api/orders/:code` —
  resolvido no briefing do lead (`docs/qa/00-briefing-do-lead.md`, seção B).
- **Estados de `Order.status`:** o MVP escreve e lê só `PLACED` —
  [DP-15](../decisoes-produto.md#dp-15--orderstatus-no-mvp).
- **Assinatura do QR:** `qrPayload` é uma URL determinística sem assinatura
  criptográfica real —
  [DP-16](../decisoes-produto.md#dp-16--qr-sem-assinatura-real).
- **Nome do cliente:** obrigatório, mínimo 2 caracteres, máximo 60 —
  [DP-24](../decisoes-produto.md#dp-24--nome-do-cliente-obrigatório-no-checkout).

## Critérios de aceite

- O formulário tem foco automático no campo de nome; o CTA "Confirmar
  pedido" fica desabilitado enquanto o nome não passa na validação de DP-24.
- Tentar confirmar com o nome inválido mostra a mensagem de erro de DP-24 sem
  disparar a chamada à API.
- Confirmar chama `POST /api/orders`, que revalida no servidor cada item, os
  grupos de modificadores, o restaurante aberto, a sacola mono-restaurante e
  recalcula subtotal/desconto/total a partir do banco.
- Sucesso redireciona para `/pedido/[codigo]`, que mostra tudo o que está
  listado em `docs/qa/respostas-po.md` (P-01) — QR, código copiável, tempo
  estimado, ficha do restaurante, recibo e passo a passo da retirada.
- O código segue o formato `MA-XXXX`, maiúsculo, sem `0/O/1/I`.
- Depois da confirmação, a sacola esvazia — voltar para `/sacola` mostra o
  estado vazio (`05b`).
- Reabrir `/pedido/[codigo]` mais tarde mostra os mesmos valores travados no
  momento da confirmação, mesmo que o cardápio tenha mudado de preço
  depois.
- Se `POST /api/orders` falhar, a sacola continua intacta e a tela de erro
  (US-09, tela `10`) aparece com as três ações descritas.
