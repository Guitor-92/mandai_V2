# US-06: Gerenciar sacola

**Como** cliente, **quero** ajustar quantidade, remover itens e ver o total, **antes de** finalizar.

- Referência visual: `05 · Sacola`, `05b · Sacola vazia`; mini-sacola em `03 · Cardápio do restaurante`
- Estados envolvidos: vazia, com itens, quantidade em alteração, item removido, com cupom aplicado (US-07)
- Entidades de domínio: `Restaurant`, `MenuItem`, `ModifierGroup`, `ModifierOption` (leitura); `Order`/`OrderItem` só na finalização (US-08)

## Contexto

A sacola é do navegador, não do servidor: ela vive no armazenamento local e só
existe como dado do Mandaí quando vira pedido. Por isso não há entidade
`Carrinho` no ERD.

A sacola é **mono-restaurante** — todos os itens são de uma casa só, e é isso
que a US-10 protege.

A tela `05` lista cada item com quantidade, nome, os modificadores escolhidos
("Acompanha: mel da casa"), a observação em itálico, o preço da linha, o
seletor de quantidade, "Editar item" e a lixeira. À direita fica o resumo:
subtotal, "Taxa de retirada — Grátis", linha de cupom quando houver, total e o
CTA de finalizar, com o lembrete "Sem cadastro."

A tela `05b` cobre o vazio com humor ("Carrinho vazio que nem geladeira de
domingo"), sugestões de restaurantes, pedidos recentes, o recap de como
funciona a retirada em três passos e o convite do cupom.

## O que entra

- Listar as linhas da sacola com nome, modificadores, observação e total da
  linha.
- Aumentar e diminuir quantidade por linha, com o total recalculando na hora.
- Remover uma linha.
- "Editar item" reabrindo o modal da US-05 já preenchido.
- Resumo com subtotal, taxa de retirada (sempre grátis) e total.
- Cabeçalho com o restaurante da sacola e o tempo de preparo.
- Estado vazio completo com sugestões e o recap de como funciona.
- Persistir a sacola entre visitas, no navegador.

## O que NÃO entra

- Aplicar cupom (US-07) — aqui só a linha de desconto é exibida.
- Finalizar o pedido e gerar código (US-08).
- Aviso de troca de restaurante (US-10).
- Salvar sacola no servidor, sincronizar entre dispositivos ou recuperar
  carrinho abandonado — não há cadastro no MVP.
- Agendar horário de retirada.

## Decisões

- **Identidade da linha:** cada adição vira uma linha nova, sem merge —
  [DP-11](../decisoes-produto.md#dp-11--identidade-da-linha-na-sacola).
- **"Pedidos recentes":** entra, guardado em localStorage; some da tela
  `05b` se não houver nenhum —
  [DP-12](../decisoes-produto.md#dp-12--pedidos-recentes-na-sacola-vazia).
- **"Ver mapa":** sai do MVP —
  [DP-13](../decisoes-produto.md#dp-13--ver-mapa-sai-do-mvp).
- **Cupom no resumo:** quando aplicado, mostra a linha de desconto calculada
  pelo endpoint de validação —
  [DP-14](../decisoes-produto.md#dp-14--cupom-entra-no-mvp) (detalhes em
  US-07).
- **Troca de restaurante:** ver
  [DP-21](../decisoes-produto.md#dp-21--troca-de-restaurante-com-sacola-entra-no-mvp)
  e US-10 — é o que acontece quando a pessoa confirma a troca.

## Critérios de aceite

- A sacola lista cada linha com nome do prato, modificadores escolhidos,
  observação (se houver), quantidade e total da linha.
- Aumentar ou diminuir a quantidade de uma linha recalcula o total daquela
  linha e o total geral, na hora, sem recarregar a página.
- Remover uma linha some ela da lista e recalcula o total geral.
- "Editar item" reabre o modal da US-05 pré-preenchido com os dados daquela
  linha específica — sem misturar com outra linha do mesmo prato.
- O resumo mostra subtotal, "Taxa de retirada — Grátis" e total; a linha de
  cupom só aparece quando um cupom válido está aplicado (US-07).
- A sacola sobrevive a fechar e reabrir o navegador (persistida em
  localStorage).
- Com a sacola vazia, a tela `05b` mostra sugestões, o recap de como funciona
  a retirada e, só se houver pedido recente guardado neste navegador, a seção
  "Pedidos recentes" — sem ela, essa seção não aparece.
- Não existe botão "Ver mapa" no cabeçalho da sacola.
