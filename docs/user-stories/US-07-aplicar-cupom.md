# US-07: Aplicar cupom

> **Confirmada no MVP.** Estava marcada como opcional; o PO decidiu que
> **entra**, com a entidade `Coupon` mantida como está no ERD — ver
> [DP-14](../decisoes-produto.md#dp-14--cupom-entra-no-mvp).

**Como** cliente, **quero** usar um código de cupom, **para** receber desconto.

- Referência visual: `05 · Sacola` (campo "Cupom de desconto" + botão "Aplicar"); banner de origem em `01 · Home` e `05b · Sacola vazia`
- Estados envolvidos: campo vazio, validando, cupom válido (linha de desconto), cupom inválido/expirado, pedido abaixo do mínimo
- Entidades de domínio: `Coupon`, `Order` (campos `couponCode` e `discountCents`)

## Contexto

O cupom nasce no marketing da Home: o banner "Tá com fome? Manda 20% off"
divulga o código `MANDA20`, válido até domingo. Na sacola há um campo com ícone
de ticket, o botão "Aplicar" e, quando aceito, uma linha "Cupom MANDA20" em
vermelho no resumo, puxando o total de R$ 64,80 para R$ 51,84.

O `Coupon` suporta desconto percentual **ou** valor fixo, tem pedido mínimo,
data de validade e uma chave de ativação. O desconto é **congelado** no pedido
no momento da confirmação — uma promoção que muda depois não reescreve um
pedido já feito.

## O que entra

- Campo de código na sacola com botão "Aplicar".
- Validação no servidor: cupom existe, está ativo, não expirou e o subtotal
  atinge o mínimo.
- Linha de desconto no resumo com o rótulo do cupom e o total recalculado.
- Mensagem clara quando o código não vale.
- Remover o cupom aplicado.
- Congelar o desconto no pedido ao confirmar.

## O que NÃO entra

- Empilhar mais de um cupom no mesmo pedido.
- Cupom por restaurante, por categoria ou primeiro pedido — o modelo tem um
  cupom global só.
- Limite de uso por pessoa (não há cadastro).
- Tela de administração de cupons.
- Aplicar cupom automaticamente a partir do banner da Home.

## Decisões

Todas as pendências desta história foram fechadas em
[DP-14](../decisoes-produto.md#dp-14--cupom-entra-no-mvp):

- **Endpoint de validação:** `POST /api/coupons/validate { code, subtotalCents }`.
- **Onde o desconto é calculado:** preview no `validate`, recálculo autoritativo
  em `POST /api/orders` a partir dos itens revalidados no banco.
- **Estado de erro do cupom:** copy definida para inválido, expirado e abaixo
  do pedido mínimo — ver DP-14.
- **Seed:** cupom único `MANDA20`, 20% off, pedido mínimo R$ 30,00, válido até
  domingo da semana de lançamento.

## Critérios de aceite

- O campo de cupom na sacola aceita um código e, ao clicar "Aplicar", chama
  `POST /api/coupons/validate`.
- Cupom válido mostra a linha "Cupom MANDA20 · −R$ X,XX" no resumo e recalcula
  o total exibido.
- Cupom inexistente, expirado ou abaixo do pedido mínimo mostra a mensagem
  correspondente de DP-14, sem aplicar desconto nenhum.
- É possível remover um cupom já aplicado, voltando o resumo ao subtotal sem
  desconto.
- Ao confirmar o pedido (US-08), o desconto gravado no `Order` é recalculado
  no servidor a partir do cupom e dos itens revalidados — nunca aceito
  diretamente do valor que a tela mandou.
- Tentar finalizar com o restaurante fechado e um cupom aplicado mostra a
  mensagem padrão de restaurante fechado (US-09), não um erro de cupom.
