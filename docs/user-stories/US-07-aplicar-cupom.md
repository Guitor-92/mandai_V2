# US-07: Aplicar cupom

> **Opcional no MVP.** Se o escopo apertar, esta é a primeira a sair — e junto
> com ela a entidade `Coupon`, mantendo apenas `couponCode` e `discountCents`
> congelados no pedido.

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

## [DECISÃO PENDENTE]

- **Endpoint de validação.** O handoff prevê
  `POST /api/coupons/validate { code, cart }`, mas ele não aparece na lista de
  endpoints do `ARQUITETURA.md` §2.4. Se a US entrar, o endpoint entra junto.
- **Onde o desconto é calculado.** Validar no campo e recalcular de novo ao
  confirmar o pedido, ou só no fechamento? O valor mostrado na sacola precisa
  bater com o que sai no `Order`.
- **Estado de erro do cupom** não está desenhado em nenhuma tela.
