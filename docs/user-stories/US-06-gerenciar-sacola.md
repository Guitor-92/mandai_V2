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

## [DECISÃO PENDENTE]

- **Identidade da linha.** O mesmo prato com modificadores diferentes deve
  virar duas linhas ou uma? O design mostra linhas distintas, mas a regra de
  agrupamento não está escrita.
- **"Pedidos recentes"** na tela `05b` ("Pediu na semana passada") pressupõe
  histórico. Sem cadastro, só sobreviveria no navegador. Confirmar se entra.
- **"Ver mapa"** no cabeçalho da sacola não tem destino definido.
